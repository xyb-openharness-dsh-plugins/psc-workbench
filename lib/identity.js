/**
 * 身份常量：插件 id、API 前缀、数据根目录名、UI 入口（家族口径，PSC 版）。
 * `id` 必须与 cordis.patch.yml 的 insert id 一致（psc-main）。
 * API_PREFIX 是宿主挂载前缀（含 /api，家族 PSC 仓口径）；页面拼 `${API_PREFIX}/bootstrap`。
 * 守卫只禁「交界处重复 /api」，不许 includes('/api') 一刀切（家族踩 4）。
 */
export const PLUGIN_ID = 'psc-main';
export const PACKAGE_NAME = '@xyb-community/psc-workbench';
export const API_PREFIX = '/api/psc';
export const UI_MOUNT = '/psc';
export const HOME_DIR = 'psc';
export const DB_FILE = 'psc-workbench.sqlite';
export const UI_ENTRY = 'index.html';
export const DEV_PORT = 8149;
