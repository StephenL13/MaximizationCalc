// src/lib/algorithm.js

import { formatBigM } from "./helper/formatDisplayValue"
import { toFraction } from "./helper/toFraction"

export function solveBigM({ objectiveName, objectiveCoeffs, constraints }) {
  const M = 1000
  const numVars = objectiveCoeffs.length
  const tableaux = []

  // 1) Build initial rows, basis and Cᵦ
  const rows = []
  const basis = []
  const cb = []

  let slackCount = 0, artificialCount = 0
  constraints.forEach(c => {
    if (c.sign === "<=")        slackCount++
    if (c.sign === ">=") { 
      slackCount++
      artificialCount++
    }
    if (c.sign === "=")         artificialCount++
  })
  const totalSlack      = slackCount
  const totalArtificial = artificialCount

  let s = 0, a = 0
  constraints.forEach(con => {
    // pull out raw coeffs + rhs + sign
    let coeffs = con.coeffs.map(c => parseFloat(c) || 0)
    let sign   = con.sign
    let rhs    = parseFloat(con.rhs) || 0

    // if RHS < 0, multiply entire eqn by −1 and flip ≤/≥
    if (rhs < 0) {
      coeffs = coeffs.map(c => -c)
      rhs    = -rhs
      if      (sign === "<=") sign = ">="
      else if (sign === ">=") sign = "<="
    }

    // start building the full tableau row
    const r = [...coeffs]

    // append slack/artificial placeholders
    for (let i = 0; i < totalSlack;      i++) r.push(0)
    for (let i = 0; i < totalArtificial; i++) r.push(0)

    // inject the correct slack/artificial columns
    if (sign === "<=") {
      r[numVars + s] = 1
      basis.push(`s${s+1}`)
      cb.push(0)
      s++
    }
    else if (sign === ">=") {
      r[numVars + s]                   = -1
      r[numVars + totalSlack + a]      = 1
      basis.push(`a${a+1}`)
      cb.push(-M)
      s++; a++
    }
    else { // "="
      r[numVars + totalSlack + a] = 1
      basis.push(`a${a+1}`)
      cb.push(-M)
      a++
    }

    // finally push the (now nonnegative) RHS
    r.push(rhs)
    rows.push(r)
  })

  // 2) build Cⱼ and headers
  const cj = [
    ...objectiveCoeffs.map(c => parseFloat(c)||0),
    ...Array(totalSlack).fill(0),
    ...Array(totalArtificial).fill(-M),
    0
  ]
  const headers = [
    ...Array(numVars).fill(0).map((_,i)=>`x${i+1}`),
    ...Array(totalSlack).fill(0).map((_,i)=>`s${i+1}`),
    ...Array(totalArtificial).fill(0).map((_,i)=>`a${i+1}`),
    "RHS"
  ]

  // 3) helper calculators
  const computeZj        = () => headers.map((_,col) =>
    +rows.reduce((sum,r,i)=> sum + cb[i]*r[col], 0).toFixed(6)
  )
  const computeZjMinusCj = zj => zj.map((z,i)=> +(z - cj[i]).toFixed(6))
  const computeQi        = (pivotCol, sourceRows) =>
    sourceRows.map(r =>
      r[pivotCol] > 0
        ? +(r[headers.length-1] / r[pivotCol]).toFixed(6)
        : null
    )

  // 4) snapshot routine
  function snapshot({ pivotCol=null, pivotRow=null, pivotElement=null, sourceRows=null }) {
    const zj        = computeZj()
    const zjMinus   = computeZjMinusCj(zj)
    const qi        = pivotCol===null ? [] : computeQi(pivotCol, sourceRows || rows)

    // solution block
    const solution = {}
    headers.forEach((h,i) => {
      if (h === "RHS") return
      const bi = basis.indexOf(h)
      solution[h] = bi >= 0
        ? toFraction(+rows[bi][headers.length-1].toFixed(8))
        : "0"
    })
    solution[objectiveName] = toFraction(
      +rows.reduce((tot,r,i)=> tot + cb[i]*r[headers.length-1], 0)
        .toFixed(8)
    )

    // Zj steps
    const zjSteps = headers.map((_, j) => {
      const terms = []
      let total = 0
      rows.forEach((r,i) => {
        if (cb[i] !== 0 && r[j] !== 0) {
          const prod = +(cb[i]*r[j]).toFixed(6)
          total += prod
          terms.push(`${formatBigM(cb[i])}(${formatBigM(r[j])})`)
        }
      })
      return terms.length
        ? `${terms.join(" + ")} = ${formatBigM(total)}`
        : "0"
    })

    // Zj − Cj steps
    const zjMinusCjSteps = zj.map((z,i) =>
      `${formatBigM(z)} - ${formatBigM(cj[i])} = ${formatBigM(z - cj[i])}`
    )

    // Qi steps
    const qiSteps = pivotCol===null
      ? []
      : rows.map(r => {
          if (r[pivotCol] > 0) {
            const rhsVal = r[headers.length-1]
            const div    = r[pivotCol]
            return `${formatBigM(rhsVal)} / ${formatBigM(div)} = ${formatBigM(rhsVal/div)}`
          }
          return null
        })

    // row‐operations (if we have old rows)
    const operations = []
    if (sourceRows != null) {
      // pivot normalization
      const old = sourceRows[pivotRow]
      operations.push({
        description: `R${pivotRow+1}(new) = R${pivotRow+1}(old) × 1/${formatBigM(pivotElement)}`,
        detailedSteps: old.map(v =>
          `${formatBigM(v)} × 1/${formatBigM(pivotElement)} = ${formatBigM(v/pivotElement)}`
        )
      })
      // eliminate others
      sourceRows.forEach((oldRow,i) => {
        if (i !== pivotRow) {
          const m = oldRow[pivotCol]
          operations.push({
            description: `R${i+1}(new) = R${i+1}(old) - (${formatBigM(m)}) × R${pivotRow+1}`,
            detailedSteps: oldRow.map((v,j) => {
              const sub = m * rows[pivotRow][j]
              return `${formatBigM(v)} - (${formatBigM(m)} × ${formatBigM(rows[pivotRow][j])}) = ${formatBigM(v-sub)}`
            })
          })
        }
      })
    }

    tableaux.push({
      headers,
      rows:         rows.map(r=>r.map(formatBigM)),
      basis:        [...basis],
      cb:           cb.map(formatBigM),
      cj:           cj.map(formatBigM),
      zj:           zj.map(formatBigM),
      zjMinusCj:    zjMinus.map(formatBigM),
      qi:           qi.map(q=> q==null ? null : formatBigM(q)),
      totalZ:       formatBigM(rows.reduce((tot,r,i)=>tot + cb[i]*r[headers.length-1],0)),
      solution,
      operations,
      zjSteps,
      zjMinusCjSteps,
      qiSteps,
      pivot: { pivotCol, pivotRow, pivotElement }
    })
  }

  // 5) INITIAL tableau: pick entering column
  let zj0      = computeZj()
  let zjm0     = computeZjMinusCj(zj0)
  let pivotCol = Math.min(...zjm0) < 0
    ? zjm0.indexOf(Math.min(...zjm0))
    : -1

  // — NEW: compute the very first Qᵢ vector & pivot row/element
  const initialQi = pivotCol >= 0 ? computeQi(pivotCol, rows) : []
  let initialMin = Infinity
  let initialPivotRow = -1
  initialQi.forEach((q,i) => {
    if (q !== null && q > 0 && q < initialMin) {
      initialMin = q
      initialPivotRow = i
    }
  })
  const initialPivotElement =
    initialPivotRow >= 0
      ? rows[initialPivotRow][pivotCol]
      : null

  // now snapshot **with** that initial pivotRow & pivotElement
  snapshot({
    pivotCol,
    pivotRow:     initialPivotRow,
    pivotElement: initialPivotElement
  })

  // 6) subsequent iterations
  while (pivotCol >= 0) {
    // pick pivotRow by smallest positive Qi
    const currentQi = computeQi(pivotCol, rows)
    let minR=Infinity, pivotRow=-1
    currentQi.forEach((q,i)=> {
      if (q!==null && q>0 && q<minR) { minR=q; pivotRow=i }
    })
    if (pivotRow < 0) break

    // pivot element
    const pivotElement = rows[pivotRow][pivotCol]

    // normalize pivot row
    rows[pivotRow] = rows[pivotRow].map(v => +(v/pivotElement).toFixed(6))

    // eliminate others
    rows.forEach((r,i)=> {
      if (i!==pivotRow) {
        const m = r[pivotCol]
        rows[i] = r.map((v,j)=> +(v - m*rows[pivotRow][j]).toFixed(6))
      }
    })

    // update basis & Cᵦ
    basis[pivotRow] = headers[pivotCol]
    cb[pivotRow]    = cj[pivotCol]

    // next pivotCol
    const zj1   = computeZj()
    const zjm1  = computeZjMinusCj(zj1)
    pivotCol    = Math.min(...zjm1) < 0 ? zjm1.indexOf(Math.min(...zjm1)) : -1

    // snapshot with now‐old rows
    snapshot({
      pivotCol,
      pivotRow,
      pivotElement,
      sourceRows: [...rows]
    })
  }

  // 7) hide Qᵢ on the very last tableau
  if (tableaux.length) {
    tableaux[tableaux.length-1].qi =
      tableaux[tableaux.length-1].qi.map(() => null)
  }
  // 8) mark infeasible
  const last = tableaux[tableaux.length-1]
  if (last) last.infeasible = last.basis.some(b => b.startsWith("a"))

  return tableaux
}
