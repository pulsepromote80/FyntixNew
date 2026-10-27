export function encryptData(data: string): string {
  return btoa(data);
}

export function decryptData(encrypted: string): string {
  try {
    return atob(encrypted);
  } catch {
    return "";
  }
}
