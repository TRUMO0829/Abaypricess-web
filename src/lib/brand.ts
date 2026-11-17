// Захиалагчийн албан ёсны лого (эх файл: docs/brief/adapt-logo.png)-г тунгалаг фонтой болгосон хувилбар.
// Сайт дээр CSS mask болгон ашигладаг тул өнгө нь token-оос авна (light: primary, dark: цагаан).
export const brandLogo = {
  src: "/brand/adapt-logo.png",
  width: 1469,
  height: 474,
}

// next/og нь CSS token уншихгүй тул OG зурагт hex утгыг ашиглана (#441e82 = --primary)
export const brandHex = {
  primary: "#441e82",
  ink: "#18141f",
  muted: "#5b5468",
}
