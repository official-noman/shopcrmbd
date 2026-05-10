export function maskBDPhone(value: string) {
  // Keep digits and leading +
  let s = value.replace(/[^\d+]/g, "");
  if (s.startsWith("+88")) s = s.slice(3);
  if (s.startsWith("88") && s.length > 11) s = s.slice(2);
  // Keep only digits now
  s = s.replace(/[^\d]/g, "");
  // If user starts typing without leading 0, try to help (e.g. 1xxxxxxxxx)
  if (s.length > 0 && s[0] !== "0") s = "0" + s;
  // Max 11 digits
  return s.slice(0, 11);
}

