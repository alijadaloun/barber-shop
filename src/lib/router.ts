/** Vite `base` (e.g. `/barber-shop/` on GitHub Pages, `/` locally). */
const BASE = import.meta.env.BASE_URL;

/** Browser pathname → app route (`/`, `/book`, …). */
export function stripBase(pathname: string): string {
  const baseNoSlash = BASE.replace(/\/$/, "");
  if (!baseNoSlash) return pathname || "/";
  if (pathname === baseNoSlash || pathname === `${baseNoSlash}/`) return "/";
  if (pathname.startsWith(`${baseNoSlash}/`)) {
    return pathname.slice(baseNoSlash.length) || "/";
  }
  return pathname;
}

/** App route → URL path for `history.pushState`. */
export function toPublicPath(appPath: string): string {
  const p = appPath.startsWith("/") ? appPath : `/${appPath}`;
  if (p === "/") return BASE.endsWith("/") ? BASE : `${BASE}/`;
  const baseNoSlash = BASE.replace(/\/$/, "");
  return `${baseNoSlash}${p}`;
}
