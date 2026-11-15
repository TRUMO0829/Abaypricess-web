export type Theme = "light" | "dark" | "system"

export const THEME_STORAGE_KEY = "abay-theme"

/** <head>-д paint-аас өмнө ажиллаж `.dark` class-ийг тавина (flash гаргахгүй). */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`

export function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {}
}
