import { formatBigM } from "./helper/formatDisplayValue"
import { toFraction } from "./helper/toFraction"

export function solveBigM({ objectiveName, objectiveCoeffs, constraints }) {
  const M = 1000
  const numVars = objectiveCoeffs.length
  const tableaux = []

  const rows = []
  const basis = []
  const cb = []

  let slackCount = 0
  let artificialCount = 0
  constraints.forEach(c => {
    if (c.sign === "<=") slackCount++
    if (c.sign === ">=") {
      slackCount++
      artificialCount++
    }
    if (c.sign === "=") artificialCount++
  })

  const totalSlack = slackCount
  const totalArtificial = artificialCount

  let slackIndex = 0
  let artificialIndex = 0

  constraints.forEach((constraint) => {
    const row = []
    for (let i = 0; i < numVars; i++) {
      row.push(parseFloat(constraint.coeffs[i]) || 0)
    }
    for (let i = 0; i < totalSlack; i++) row.push(0)
    for (let i = 0; i < totalArtificial; i++) row.push(0)

    if (constraint.sign === "<=") {
      row[numVars + slackIndex] = 1
      basis.push(`s${slackIndex + 1}`)
      cb.push(0)
      slackIndex++
    }

    if (constraint.sign === ">=") {
      row[numVars + slackIndex] = -1
      row[numVars + totalSlack + artificialIndex] = 1
      basis.push(`a${artificialIndex + 1}`)
      cb.push(-M)
      slackIndex++
      artificialIndex++
    }

    if (constraint.sign === "=") {
      row[numVars + totalSlack + artificialIndex] = 1
      basis.push(`a${artificialIndex + 1}`)
      cb.push(-M)
      artificialIndex++
    }

    row.push(parseFloat(constraint.rhs) || 0)
    rows.push(row)
  })

  const cj = []
  for (let i = 0; i < numVars; i++) cj.push(parseFloat(objectiveCoeffs[i]) || 0)
  for (let i = 0; i < totalSlack; i++) cj.push(0)
  for (let i = 0; i < totalArtificial; i++) cj.push(-M)
  cj.push(0)

  const headers = []
  for (let i = 0; i < numVars; i++) headers.push(`x${i + 1}`)
  for (let i = 0; i < totalSlack; i++) headers.push(`s${i + 1}`)
  for (let i = 0; i < totalArtificial; i++) headers.push(`a${i + 1}`)
  headers.push("RHS")

  const computeZj = () => {
    const zj = Array(headers.length).fill(0)
    for (let col = 0; col < headers.length; col++) {
      let sum = 0
      for (let row = 0; row < rows.length; row++) {
        sum += cb[row] * rows[row][col]
      }
      zj[col] = +sum.toFixed(2)
    }
    return zj
  }

  const computeZjMinusCj = zj => zj.map((z, i) => +(z - cj[i]).toFixed(2))

  const computeTotalZ = () => {
    let total = 0
    for (let i = 0; i < rows.length; i++) {
      total += cb[i] * rows[i][headers.length - 1]
    }
    return +total.toFixed(2)
  }

  const snapshot = (pivotCol = null, pivotRow = null, pivotElement = null, oldRows = null) => {
    const zj = computeZj()
    const zjMinusCj = computeZjMinusCj(zj)
    const qi = rows.map(row => {
      if (pivotCol === null || row[pivotCol] <= 0) return null
      const rhs = row[headers.length - 1]
      return +(rhs / row[pivotCol]).toFixed(6)
    })

    // —– fraction-ify solution block (unchanged) —–
    const solution = {}
    headers.forEach(h => {
      if (h === "RHS") return
      const rowIdx = basis.findIndex(b => b === h)
      solution[h] = rowIdx !== -1
        ? toFraction(+rows[rowIdx][headers.length - 1].toFixed(8))
        : "0"
    })
    solution[objectiveName] = toFraction(+computeTotalZ().toFixed(8))
    // —– end fraction-ify solution —–

    const zjSteps = headers.map((_, j) => {
      let terms = []
      let total = 0
      for (let i = 0; i < rows.length; i++) {
        const coeff = rows[i][j]
        const cbVal = cb[i]
        if (cbVal === 0 || coeff === 0) continue
        const product = +(cbVal * coeff).toFixed(6)
        total += product
        terms.push(`${formatBigM(cbVal)}(${formatBigM(coeff)})`)
      }
      return terms.length > 0 ? `${terms.join(" + ")} = ${formatBigM(total)}` : "0"
    })

    const zjMinusCjSteps = zj.map((zjVal, j) => {
      const cjVal = cj[j]
      return `${formatBigM(zjVal)} - ${formatBigM(cjVal)} = ${formatBigM(zjVal - cjVal)}`
    })

    const qiSteps = rows.map((row, i) => {
      if (pivotCol === null || row[pivotCol] <= 0) return null
      const rhs = row[headers.length - 1]
      const divisor = row[pivotCol]
      return `${formatBigM(rhs)} / ${formatBigM(divisor)} = ${formatBigM(rhs / divisor)}`
    })

    const operations = []
    if (pivotCol !== null && pivotRow !== null && pivotElement !== null && oldRows) {
      const pivotOld = oldRows[pivotRow]
      const pivotLine = `R${pivotRow + 1} (new) = R${pivotRow + 1} (old) × 1/${formatBigM(pivotElement)}`
      const pivotDetail = pivotOld.map(val => {
        const result = +(val / pivotElement).toFixed(6)
        return `${formatBigM(val)} × 1/${formatBigM(pivotElement)} = ${formatBigM(result)}`
      })
      operations.push({
        row: `R${pivotRow + 1}`,
        type: "pivot",
        description: pivotLine,
        detailedSteps: pivotDetail
      })
      for (let i = 0; i < rows.length; i++) {
        if (i !== pivotRow) {
          const mult = oldRows[i][pivotCol]
          const desc = `R${i + 1} (new) = R${i + 1} (old) - (${formatBigM(mult)}) × R${pivotRow + 1}`
          const details = oldRows[i].map((val, j) => {
            const sub = mult * rows[pivotRow][j]
            const result = +(val - sub).toFixed(6)
            return `${formatBigM(val)} - (${formatBigM(mult)} × ${formatBigM(rows[pivotRow][j])}) = ${formatBigM(result)}`
          })
          operations.push({
            row: `R${i + 1}`,
            type: "eliminate",
            description: desc,
            detailedSteps: details
          })
        }
      }
    }

    tableaux.push({
      headers: [...headers],
      rows: rows.map(r => r.map(formatBigM)),
      basis: [...basis],
      cb: cb.map(formatBigM),
      cj: cj.map(formatBigM),
      zj: zj.map(formatBigM),
      zjMinusCj: zjMinusCj.map(formatBigM),
      qi: qi.map(q => q === null ? null : formatBigM(q)),
      totalZ: formatBigM(computeTotalZ()),
      solution,
      operations,
      zjSteps,
      zjMinusCjSteps,
      qiSteps
    })
  }

  snapshot(null)

  while (true) {
    const zj = computeZj()
    const zjMinusCj = computeZjMinusCj(zj)
    const oldRows = rows.map(r => [...r])
    const pivotCol = zjMinusCj.findIndex(val => val < 0)
    if (pivotCol === -1) break

    let minRatio = Infinity
    let pivotRow = -1
    for (let i = 0; i < rows.length; i++) {
      const divisor = rows[i][pivotCol]
      if (divisor > 0) {
        const ratio = rows[i][headers.length - 1] / divisor
        if (ratio < minRatio) {
          minRatio = ratio
          pivotRow = i
        }
      }
    }
    if (pivotRow === -1) break

    const pivotElement = rows[pivotRow][pivotCol]
    rows[pivotRow] = rows[pivotRow].map(val => val / pivotElement)

    for (let i = 0; i < rows.length; i++) {
      if (i !== pivotRow) {
        const multiplier = rows[i][pivotCol]
        for (let j = 0; j < rows[i].length; j++) {
          rows[i][j] -= multiplier * rows[pivotRow][j]
        }
      }
    }

    basis[pivotRow] = headers[pivotCol]
    cb[pivotRow] = cj[pivotCol]

    snapshot(pivotCol, pivotRow, pivotElement, oldRows)
  }

  // ←── NEW: mark infeasible if any a-variable remains basic
  if (tableaux.length) {
    const last = tableaux[tableaux.length - 1]
    last.infeasible = last.basis.some(v => v.startsWith("a"))
  }

  return tableaux
}
