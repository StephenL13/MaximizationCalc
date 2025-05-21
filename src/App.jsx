import React, { useState } from "react"
import ObjectiveInput from "./components/ObjectiveInput"
import EquationInput from "./components/EquationInput"
import TableauDisplay from "./components/TableauDisplay"
import { solveBigM } from "./lib/algorithm"
import { Button } from "@/components/ui/button"

function normalizeSigns(signs, length) {
  const validSigns = ["+", "-"]
  const newSigns = []
  for (let i = 0; i < length; i++) {
    const sign = signs?.[i]
    newSigns.push(validSigns.includes(sign) ? sign : "+")
  }
  return newSigns
}

export default function App() {
  const [numVars, setNumVars] = useState(2)
  const [numConstraints, setNumConstraints] = useState(2)

  const [objectiveName, setObjectiveName] = useState("Z")
  const [objectiveCoeffs, setObjectiveCoeffs] = useState(Array(2).fill(""))

  const [constraints, setConstraints] = useState(
    Array(2)
      .fill(null)
      .map(() => ({
        coeffs: Array(2).fill(""),
        signs: Array(1).fill("+"),
        sign: "<=",
        rhs: ""
      }))
  )

  const [tableau, setTableau] = useState(null)

  const handleSolve = () => {
    // VALIDATION: need at least one var and one constraint
    if (numVars < 1 || numConstraints < 1) {
      alert("Please select at least 1 decision variable and 1 constraint before solving! UwU")
      return
    }

    const parsedConstraints = constraints.map(constraint => {
      const signs = normalizeSigns(constraint.signs, numVars - 1)
      const signedCoeffs = constraint.coeffs.map((coeff, i) => {
        const sign = i === 0 ? "+" : signs[i - 1]
        const numeric = parseFloat(coeff) || 0
        return sign === "-" ? -numeric : numeric
      })
      return {
        ...constraint,
        coeffs: signedCoeffs,
        signs,
        rhs: parseFloat(constraint.rhs) || 0
      }
    })

    const parsedObjective = objectiveCoeffs.map(c => parseFloat(c) || 0)

    const result = solveBigM({
      objectiveName,
      objectiveCoeffs: parsedObjective,
      constraints: parsedConstraints
    })

    setTableau(result)
    setConstraints(parsedConstraints)
  }

  const handleNumVarsChange = val => {
    const n = Math.max(1, parseInt(val) || 1)
    setNumVars(n)
    setObjectiveCoeffs(Array(n).fill(""))

    setConstraints(prev =>
      prev.map(c => ({
        ...c,
        coeffs: Array(n).fill(""),
        signs: normalizeSigns(c.signs, n - 1)
      }))
    )
  }

  const handleNumConstraintsChange = val => {
    const m = Math.max(1, parseInt(val) || 1)
    setNumConstraints(m)
    setConstraints(
      Array(m)
        .fill(null)
        .map(() => ({
          coeffs: Array(numVars).fill(""),
          signs: Array(numVars - 1).fill("+"),
          sign: "<=",
          rhs: ""
        }))
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Big M Method Solver (Maximization)</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">No. of Decision Variables:</label>
          <input
            type="number"
            min="1"
            value={numVars}
            onChange={e => handleNumVarsChange(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Number of Constraints</label>
          <input
            type="number"
            min="1"
            value={numConstraints}
            onChange={e => handleNumConstraintsChange(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>
      </div>

      <ObjectiveInput
        objectiveName={objectiveName}
        setObjectiveName={setObjectiveName}
        objectiveCoeffs={objectiveCoeffs}
        setObjectiveCoeffs={setObjectiveCoeffs}
      />

      <EquationInput
        constraints={constraints}
        setConstraints={setConstraints}
        variableCount={numVars}
      />

      <div className="mt-6 p-4 border rounded bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Problem Details</h2>

        <div className="mb-4">
          <h3 className="font-bold">Maximize:</h3>
          <p className="italic">
            {objectiveName} ={" "}
            {objectiveCoeffs.map((coeff, i) => (
              <span key={i}>
                {coeff}
                {coeff && <>x{i + 1}</>}
                {i < objectiveCoeffs.length - 1 && coeff ? " + " : "  "}
              </span>
            ))}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold">Subject To:</h3>
          {constraints.map((constraint, i) => (
            <p key={i} className="italic">
              {constraint.coeffs.map((coeff, j) => (
                <span key={j}>
                  {j > 0 && <> {constraint.signs[j - 1] || "+"} </>}
                  {coeff}x{j + 1}
                </span>
              ))}{" "}
              {constraint.sign} {constraint.rhs}
            </p>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="font-bold">Standard Form:</h4>
          {constraints.map((constraint, i) => (
            <p key={i} className="italic">
              {constraint.coeffs.map((coeff, j) => (
                <span key={j}>
                  {j > 0 && <> {constraint.signs[j - 1] || "+"} </>}
                  {coeff}x{j + 1}
                </span>
              ))}{" "}
              {constraint.sign === "<=" && <> + S{i + 1} </>}
              {constraint.sign === ">=" && <> - S{i + 1} + A{i + 1} </>}
              {constraint.sign === "=" && <> + A{i + 1} </>}
              = {constraint.rhs}
            </p>
          ))}
        </div>
      </div>

      <Button
        className="mt-4"
        onClick={handleSolve}
        disabled={numVars < 1 || numConstraints < 1}
      >
        Solve
      </Button>

      {tableau &&
        tableau.map((t, i) => (
          <div key={i} className="mb-8">
            <h3 className="font-bold text-lg mb-2">Tableau {i + 1}</h3>
            <TableauDisplay tableau={t} />

            <div className="mt-4 text-sm text-black-800">
              <h4 className="font-semibold mb-2">Row Operations:</h4>
              <ul className="ml-4 list-disc space-y-4">
                {t.operations.map((op, idx) => (
                  <li key={idx}>
                    <div className="font-medium">{op.description}</div>
                    <div className="ml-4 mt-1 text-gray-700">
                      {op.detailedSteps.map((step, i) => (
                        <div key={i}>{step}</div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 text-sm text-black-800">
              <h4 className="font-semibold mb-1">ZJ Calculations:</h4>
              {t.zjSteps.map((step, idx) => (
                <div key={idx}>{step}</div>
              ))}
            </div>

            <div className="mt-2 text-sm text-black-800">
              <h4 className="font-semibold mb-1">ZJ - CJ:</h4>
              {t.zjMinusCjSteps.map((step, idx) => (
                <div key={idx}>{step}</div>
              ))}
            </div>

            <div className="mt-2 text-sm text-black-800">
              <h4 className="font-semibold mb-1">Qi (RHS / Pivot Column):</h4>
              {t.qiSteps.map((step, idx) =>
                step ? (
                  <div key={idx}>
                    R{idx + 1}: {step}
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))}

      {tableau &&
        tableau.length > 0 &&
        tableau[tableau.length - 1].solution && (
          <div className="mt-6 p-4 border rounded bg-gray-100">
            <h2 className="text-xl font-semibold mb-4">Final Solution</h2>
            <table className="table-auto border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Variable</th>
                  <th className="border border-gray-300 px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  tableau[tableau.length - 1].solution
                ).map(([key, val]) => (
                  <tr key={key}>
                    <td className="border border-gray-300 px-4 py-2">{key}</td>
                    <td className="border border-gray-300 px-4 py-2">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}
