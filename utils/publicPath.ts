export function publicPath(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const base = useRuntimeConfig().app.baseURL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${path.replace(/^\//, '')}`;
}
