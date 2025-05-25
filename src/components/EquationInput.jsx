import React from "react"
import ConstraintRow from "./ConstraintRow"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

export default function EquationInput({
  constraints,
  setConstraints,
  variableCount,
}) {
  const handleConstraintChange = (index, updated) => {
    const updatedConstraints = [...constraints]
    updatedConstraints[index] = updated
    setConstraints(updatedConstraints)
  }

  return (
    <div>
      <p className="font-bold">Constraints</p>
      {constraints.map((c, i) => (
        <Card key={i} className="mb-4">
          <CardContent>
            <ConstraintRow
              index={i}
              coeffs={c.coeffs}
              signs={c.signs}
              sign={c.sign}
              rhsSign={c.rhsSign} 
              rhs={c.rhs}
              onChange={handleConstraintChange}
              variableCount={variableCount}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
