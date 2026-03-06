export function isValidReturnPath(path: string | null | undefined): path is string {
  if (!path) {
    return false;
  }
  if (!path.startsWith("/")) {
    return false;
  }
  if (path.startsWith("//")) {
    return false;
  }
  try {
    const url = new URL(path, "http://localhost");
    return url.pathname === path.split("?")[0];
  } catch {
    return false;
  }
}
