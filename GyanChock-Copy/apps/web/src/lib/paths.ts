export function isAppPanelPath(pathname: string) {
  return (
    pathname.startsWith('/student') ||
    pathname.startsWith('/admin') ||
    pathname === '/teacher' ||
    pathname.startsWith('/teacher/')
  );
}
