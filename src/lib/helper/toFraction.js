// src/lib/helper/toFraction.js
export function toFraction(decimal) {
  const tolerance = 1.0E-6
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1
  let b = decimal
  do {
    let a = Math.floor(b)
    let aux = h1
    h1 = a * h1 + h2
    h2 = aux
    aux = k1
    k1 = a * k1 + k2
    k2 = aux
    b = 1 / (b - a)
  } while (Math.abs(decimal - h1 / k1) > Math.abs(decimal) * tolerance)

  return k1 === 1 ? `${h1}` : `${h1}/${k1}`
}
