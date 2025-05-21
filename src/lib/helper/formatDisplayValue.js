// src/lib/helper/formatDisplayValue.js
import { toFraction } from "./toFraction.js"

export function formatBigM(value) {
  const M = 1000
  const epsilon = 0.0001

  if (typeof value !== "number" || !isFinite(value)) return "—"

  const mCoeff = Math.round(value / M)
  const constant = value - mCoeff * M

  let result = ""

  // M term
  if (mCoeff === 1) result += "M"
  else if (mCoeff === -1) result += "-M"
  else if (mCoeff !== 0) result += `${mCoeff}M`

  // Constant term
  if (Math.abs(constant) > epsilon) {
    const frac = toFraction(Math.abs(constant))
    if (result !== "") {
      result += constant > 0 ? ` + ${frac}` : ` - ${frac}`
    } else {
      result += constant < 0 ? `-${frac}` : `${frac}`
    }
  }

  // Edge case: zero
  if (result === "") result = "0"

  return result
}
