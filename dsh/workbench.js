/**
 * 领域服务：把"数据根 → 开库 → 播种 → 读模型"收在一个可测对象里。
 *
 * 为什么单独一层：`dsh/index.js` 要 import Schemastery（宿主提供的 peer，本仓装不上），
 * 那一行会让整个入口不可单测。把可测逻辑放这里，入口只留 wiring。
 */
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const HERE = dirname(fileURLToPath(import.meta.url));
import { openStore, closeStore, migrate } from './store.js';
import { seedDemo, seedDemoData, hasDemoData } from './demo.js';
import { readBootstrap } from './readmodels.js';
import { DB_FILE, HOME_DIR } from '../lib/identity.js';
import { version, displayVersion, build as buildDate } from '../lib/version.js';

export class Workbench {
  /**
   * @param {object} options
   * @param {string} options.root      用户资料目录（必须由用户明确指定；调用方负责校验）
   * @param {boolean} [options.seedDemo] 首次打开是否写入演示数据（默认 true，仅空库生效）
   */
  constructor({ root, seedDemo = true } = {}) {
    if (typeof root !== 'string' || root.trim() === '') throw new Error('Workbench 需要 root（用户资料目录）');
    this.root = root;
    this.dbFile = join(root, DB_FILE);
    this.db = null;
    this.seedDemo = seedDemo;
  }

  /** 打开（幂等）。迁移与播种都在这里完成。 */
  open() {
    if (this.db) return this;
    this.db = openStore(this.dbFile);
    this.migrations = migrate(this.db);
    /* 用户上次在面板里选过的资料目录优先于 cordis 的默认值（目录还在才生效）。
       少了这一步，「配置目录」选完重开 Desktop 又回到默认位置，等于没选。 */
    if (!this._rootApplied) {
      this._rootApplied = true;
      try {
        const row = this.db.prepare("SELECT value FROM app_setting WHERE key='data_root'").get();
        if (row?.value && row.value !== this.root && existsSync(row.value)) {
          closeStore(this.db);
          this.root = row.value;
          this.dbFile = join(this.root, DB_FILE);
          this.db = openStore(this.dbFile);
          this.migrations = migrate(this.db);
        }
      } catch { /* 旧库没有 app_setting 表也不该拦住打开 */ }
    }
    this.seeded = this.seedDemo ? seedDemoData(this.db) : { skipped: true, profiles: 0 };
    return this;
  }

  get dataRoot() { return this.root }

  /**
   * 切换资料目录：先开新库成功再替换，失败回滚到原库（不能把用户的数据根弄丢）。
   * 目录合法性由调用方（服务端）校验；这里只保证「切不过去就退回去」。
   */
  setDataRoot(nextRoot) {
    this.open();
    const dir = String(nextRoot || '').trim();
    if (!dir || dir === this.root) return this.root;
    const prevRoot = this.root;
    const prevFile = this.dbFile;
    closeStore(this.db);
    this.db = null;
    try {
      this.dbFile = join(dir, DB_FILE);
      this.db = openStore(this.dbFile);
      this.migrations = migrate(this.db);
      this.root = dir;
      this.db.prepare("INSERT INTO app_setting(key,value,updated_at) VALUES('data_root',?,datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at").run(dir);
      this.seeded = this.seedDemo ? seedDemoData(this.db) : { skipped: true, profiles: 0 };
      return this.root;
    } catch (error) {
      this.root = prevRoot;
      this.dbFile = prevFile;
      try { this.db = openStore(this.dbFile); } catch { this.db = null; }
      throw error;
    }
  }

  /**
   * 新建患者档案（真实用户数据，不是 demo）。
   * profile_key 用 local-<时间戳>：不与 demo 的 A/B 撞键，也不依赖姓名（同名不同人是两个人）。
   * 建完即可用：headline / action_plan / dash_keys 留空，读模型按"没有这一节"处理。
   */
  createSubject({ name, meta } = {}) {
    this.open();
    const cleanName = String(name || '').trim();
    if (!cleanName) throw new Error('请填写档案名（可以是昵称）');
    if (cleanName.length > 40) throw new Error('档案名太长（≤40 字）');
    const key = 'local-' + Date.now().toString(36);
    this.db.prepare('INSERT INTO subjects (profile_key, name, meta, headline, action_plan, dash_keys, created_on, is_demo) VALUES (?,?,?,?,?,?,?,0)')
      .run(key, cleanName, String(meta || '').trim() || '我自己记录', null, null, null, new Date().toISOString().slice(0, 10));
    return { profileKey: key, name: cleanName };
  }

  deleteSubject(profileKey) {
    this.open();
    const key = String(profileKey || '');
    if (!key || key === 'A' || key === 'B') throw new Error('演示档案不删除；只能删自己建的档案');
    this.db.prepare('DELETE FROM subjects WHERE profile_key = ? AND is_demo = 0').run(key);
    return { deleted: key };
  }

  /** 档案列表（GET /subjects；demo 与本机档案并存，is_demo 随行返回）。 */
  subjects() {
    this.open();
    return this.db.prepare('SELECT profile_key, name, meta, is_demo, created_on FROM subjects ORDER BY rowid').all()
      .map((r) => ({ profileKey: r.profile_key, name: r.name, meta: r.meta, isDemo: !!r.is_demo, createdOn: r.created_on ?? null, profile_key: r.profile_key, is_demo: r.is_demo }));
  }

  /* ---------- 临床试验收藏（saved_trials，零副作用） ---------- */

  savedTrials() {
    this.open();
    return this.db.prepare('SELECT id, profile_key, trial_ref, title, source, saved_on, note FROM saved_trials ORDER BY rowid DESC').all()
      .map((r) => ({ id: r.id, profileKey: r.profile_key, trialRef: r.trial_ref, title: r.title, source: r.source, savedOn: r.saved_on, note: r.note }));
  }

  saveTrial(rec = {}) {
    this.open();
    const ref = String(rec.trialRef ?? rec.trial_ref ?? '').trim();
    if (!ref) throw new Error('缺少 trialRef（来源库标识）');
    const key = String(rec.profileKey || '').trim() || null;
    this.db.prepare('DELETE FROM saved_trials WHERE profile_key IS ? AND trial_ref = ?').run(key, ref);
    this.db.prepare('INSERT INTO saved_trials (profile_key, trial_ref, title, source, saved_on, note) VALUES (?,?,?,?,?,?)')
      .run(key, ref, rec.title ?? null, rec.source ?? null, rec.savedOn ?? new Date().toISOString().slice(0, 10), rec.note ?? null);
    return this.savedTrials();
  }

  removeTrial(id) {
    this.open();
    this.db.prepare('DELETE FROM saved_trials WHERE id = ?').run(Number(id) || 0);
    return this.savedTrials();
  }

  close() {
    if (this.db) { closeStore(this.db); this.db = null; }
  }

  get stats() {
    if (!this.db) return null;
    const count = (sql) => this.db.prepare(sql).get().c;
    return {
      profiles: count('SELECT COUNT(*) c FROM subjects'),
      metrics: count('SELECT COUNT(*) c FROM metric_defs'),
      labs: count('SELECT COUNT(*) c FROM lab_results'),
      episodes: count('SELECT COUNT(*) c FROM episode_events'),
      screenings: count('SELECT COUNT(*) c FROM screening_records'),
      hasDemo: count('SELECT COUNT(*) c FROM subjects') > 0,
    };
  }

  bootstrap() {
    this.open();
    return readBootstrap(this.db);
  }

  profile(profileKey) {
    this.open();
    return readBootstrap(this.db).profiles.find((p) => p.key === String(profileKey || '')) ?? null;
  }

  /** 供宿主 /health 用：只报事实，不报"是否已验证" */
  status() {
    return {
      version, displayVersion, buildDate,
      homeDir: HOME_DIR,
      dbFile: DB_FILE,
      root: this.root,
      capabilities: ['bootstrap', 'profile', 'health'],
      stats: this.stats,
      seeded: this.seeded ?? null,
      migrations: this.migrations ?? null,
    };
  }

  /** 演示数据重载（幂等；force 才清空重播，仅供开发用） */
  reloadDemo(force = false) {
    this.open();
    return seedDemoData(this.db, { force });
  }

  get hasData() {
    this.open();
    return hasDemoData(this.db);
  }

  /**
   * 临床试验检索（M4 research 快照，登记状态未核实；无匹配指数、无判读列）。
   * keyword 大小写不敏感 LIKE；未取得快照时返回 honest 空态（不写零结果）。
   */
  trialMatch(keyword, opts = {}) {
    /* 双形态查找：包内（宿主装机，research 随包发出）→ root 旁路（dev 布局）；都没有如实返回不可用 */
    const candidates = [
      join(HERE, '..', 'research', 'psc', 'psc_trials_2026.sqlite'),
      join(this.root, '..', 'research', 'psc', 'psc_trials_2026.sqlite'),
    ];
    let dbPath = null;
    for (const c of candidates) if (existsSync(c)) { dbPath = c; break; }
    if (!dbPath) {
      return { available: false, reason: 'research/psc 快照不可用（M4 快照未采集或未随包发出）', records: [] };
    }
    const rdb = new DatabaseSync(dbPath, { readOnly: true });
    const kw = String(keyword || '').trim();
    const where = [];
    const params = [];
    if (kw) { where.push('title LIKE ?'); params.push('%' + kw + '%'); }
    if (opts.studyType) { where.push('study_type = ?'); params.push(String(opts.studyType)); }
    if (opts.source) { where.push('source_id = ?'); params.push(String(opts.source)); }
    const limit = Math.min(Math.max(Number(opts.limit) || 50, 1), 200);
    const sql = 'SELECT * FROM trials' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY rowid LIMIT ?';
    const rows = rdb.prepare(sql).all(...params, limit);
    /* 候选池口径必须写在卡头上：已载多少、返回多少、不是全库扫描（35 号 §六） */
    const loaded = rdb.prepare('SELECT COUNT(*) c FROM trials').get().c;
    const studyTypes = rdb.prepare("SELECT DISTINCT study_type FROM trials WHERE study_type IS NOT NULL ORDER BY study_type").all().map((r) => r.study_type);
    const sources = rdb.prepare("SELECT DISTINCT source_id FROM trials WHERE source_id IS NOT NULL ORDER BY source_id").all().map((r) => r.source_id);
    const out = rows.map((r) => ({
      recordId: r.record_id, title: r.title, studyType: r.study_type,
      sponsors: r.sponsors ? JSON.parse(r.sponsors) : null,
      registryNumbers: r.registry_numbers ? JSON.parse(r.registry_numbers) : null,
      recruitmentStatus: r.recruitment_status ?? null,
      sourceUrl: r.source_url, statusNote: r.status_note, snapshotDate: r.snapshot_date,
    }));
    rdb.close();
    return {
      available: true,
      snapshotDate: out[0]?.snapshotDate ?? null,
      total: out.length,
      candidatePool: { loaded, returned: out.length, limit, notFullScan: true, studyTypes, sources },
      records: out,
    };
  }
}

export { readBootstrap, seedDemoData, seedDemo, openStore, closeStore };
