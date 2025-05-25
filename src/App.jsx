// src/App.jsx
import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import ObjectiveInput from "./components/ObjectiveInput"
import EquationInput from "./components/EquationInput"
import TableauDisplay from "./components/TableauDisplay"
import { solveBigM } from "./lib/algorithm"
import { Button } from "@/components/ui/button"

export default function App() {
  const [numVars, setNumVars] = useState(2)
  const [numConstraints, setNumConstraints] = useState(2)

  const [objectiveName, setObjectiveName] = useState("Z")
  const [objectiveCoeffs, setObjectiveCoeffs] = useState(Array(2).fill(""))
  const [objectiveSigns, setObjectiveSigns] = useState(Array(2).fill("+"))

  const [constraints, setConstraints] = useState(
    Array(2).fill(null).map(() => ({
      coeffs: Array(2).fill(""),
      signs: Array(2).fill("+"),
      sign: "<=",
      rhsSign: "+",
      rhs: ""
    }))
  )

  // make tableau an empty array by default (never null)
  const [tableau, setTableau] = useState([])

  const handleSolve = () => {
    if (numVars < 2 || numConstraints < 1) {
      alert("Please select at least 1 decision variable and 1 constraint!")
      return
    }

    // parse user input into numbers
    const parsedConstraints = constraints.map(c => {
      const signedCoeffs = c.signs.map((s,i) => {
        const n = parseFloat(c.coeffs[i]) || 0
        return s === "-" ? -n : n
      })
      let rhsVal = parseFloat(c.rhs) || 0
      if (c.rhsSign === "-") rhsVal = -rhsVal
      return { ...c, coeffs: signedCoeffs, rhs: rhsVal }
    })
    const parsedObjective = objectiveCoeffs.map((c,i) => {
      const n = parseFloat(c) || 0
      return objectiveSigns[i] === "-" ? -n : n
    })

    // run the solver
    const result = solveBigM({
      objectiveName,
      objectiveCoeffs: parsedObjective,
      constraints: parsedConstraints
    })
    setTableau(result)
  }

  const handleNumVarsChange = val => {
    const n = Math.min(10, Math.max(2, parseInt(val) || 2))
    setNumVars(n)
    setObjectiveCoeffs(Array(n).fill(""))
    setObjectiveSigns(Array(n).fill("+"))
    setConstraints(prev =>
      prev.map(c => ({
        ...c,
        coeffs: Array(n).fill(""),
        signs:  Array(n).fill("+")
      }))
    )
  }

  const handleNumConstraintsChange = val => {
    const m = Math.min(10, Math.max(1, parseInt(val) || 1))
    setNumConstraints(m)
    setConstraints(
      Array(m).fill(null).map(() => ({
        coeffs: Array(numVars).fill(""),
        signs:  Array(numVars).fill("+"),
        sign: "<=",
        rhsSign: "+",
        rhs: ""
      }))
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Big M Method Solver (Max)</h1>

      {/* --- Controls for #vars and #constraints --- */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-bold">Decision Variables Count</label>
          <Input
            type="number" min={2} max={10}
            value={numVars}
            onChange={e => handleNumVarsChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block font-bold">Constraints Count</label>
          <Input
            type="number" min={1} max={10}
            value={numConstraints}
            onChange={e => handleNumConstraintsChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* --- Objective Function Input --- */}
      <ObjectiveInput
        objectiveName={objectiveName}
        setObjectiveName={setObjectiveName}
        objectiveCoeffs={objectiveCoeffs}
        objectiveSigns={objectiveSigns}
        setObjectiveCoeffs={setObjectiveCoeffs}
        setObjectiveSigns={setObjectiveSigns}
      />

      {/* --- Constraints Input --- */}
      <EquationInput
        constraints={constraints}
        setConstraints={setConstraints}
        variableCount={numVars}
      />

      {/* --- Problem Details (always visible) --- */}
      <div className="mt-6 p-4 border rounded bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Problem Details</h2>

        {/* Maximize */}
        <div className="mb-4">
          <h3 className="font-bold">Maximize:</h3>
          <p className="italic">
            {objectiveName} ={" "}
            {objectiveCoeffs.map((coeff,i) => {
              const sign = objectiveSigns[i] === "-" ? "-" : "+"
              const prefix = i === 0
                ? (sign === "-" ? "-" : "")
                : ` ${sign} `
              return (
                <span key={i}>
                  {prefix}{Math.abs(coeff)}x{i+1}
                </span>
              )
            })}
          </p>
        </div>

        {/* Subject To */}
        <div className="mb-4">
          <h3 className="font-bold">Subject To:</h3>
          {constraints.map((c, i) => (
            <p key={i} className="italic">
              {c.coeffs.map((v,j) => {
                const termSign = c.signs[j]==="-"?"-":"+"
                const prefix = j===0
                  ? (termSign==="-"?"-":"")
                  : ` ${termSign} `
                return (
                  <span key={j}>
                    {prefix}{Math.abs(v)}x{j+1}
                  </span>
                )
              })}{" "}
              {c.sign}{" "}
              {c.rhsSign === "-" ? "-" : ""}{Math.abs(c.rhs)}
            </p>
          ))}
        </div>

        {/* Standard Form */}
        <div>
          <h4 className="font-bold">Standard Form:</h4>
          {constraints.map((c,i) => (
            <p key={i} className="italic">
              {c.coeffs.map((v,j) => {
                const termSign = c.signs[j]==="-"?"-":"+"
                const prefix = j===0
                  ? (termSign==="-"?"-":"")
                  : ` ${termSign} `
                return (
                  <span key={j}>
                    {prefix}{Math.abs(v)}x{j+1}
                  </span>
                )
              })}
              {c.sign === "<=" && ` + S${i+1}`}
              {c.sign === ">=" && ` - S${i+1} + A${i+1}`}
              {c.sign === "="  && ` + A${i+1}`}
              {" = "}
              {c.rhsSign === "-"?"-":""}{Math.abs(c.rhs)}
            </p>
          ))}
        </div>
      </div>

      {/* --- Solve Button --- */}
      <Button
        className="mt-4"
        onClick={handleSolve}
        disabled={numVars<2||numConstraints<1}
      >
        Solve
      </Button>

      {/* --- Tableaux & Steps --- */}
      {tableau.map((t,i) => (
        <div key={i} className="mb-8">
          <h3 className="font-bold text-lg mb-2">Tableau {i+1}</h3>
          <TableauDisplay tableau={t} />

          {/* If you want to echo out the row‐ops, Zj steps, Qi steps etc. you already have: */}
          <div className="mt-4 text-sm">
            <h4 className="font-semibold">Row Operations:</h4>
            <ul className="list-disc ml-4">
              {t.operations.map((op,idx) => (
                <li key={idx}>
                  <div className="font-medium">{op.description}</div>
                  <div className="ml-6">
                    {op.detailedSteps.map((s,j)=>(
                      <div key={j}>{s}</div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <h4 className="mt-3 font-semibold">Zⱼ Calculations:</h4>
            {t.zjSteps.map((s,idx)=><div key={idx}>{s}</div>)}

            <h4 className="mt-2 font-semibold">Zⱼ–Cⱼ:</h4>
            {t.zjMinusCjSteps.map((s,idx)=><div key={idx}>{s}</div>)}

            <h4 className="mt-2 font-semibold">Qᵢ (RHS / Pivot Col):</h4>
            {t.qiSteps.map((s,idx)=> s && <div key={idx}>R{idx+1}: {s}</div>)}
          </div>
        </div>
      ))}

      {/* --- Final Solution --- */}
      {tableau.length > 0 && tableau[tableau.length-1].solution && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-semibold mb-4">Final Solution</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border p-2">Variable</th>
                <th className="border p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tableau[tableau.length-1].solution).map(([k,v])=>(
                <tr key={k}>
                  <td className="border p-2">{k}</td>
                  <td className="border p-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
