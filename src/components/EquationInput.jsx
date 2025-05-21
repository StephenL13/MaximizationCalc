import React from "react"
import ConstraintRow from "./ConstraintRow"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function EquationInput({ constraints, setConstraints }) {
  const handleConstraintChange = (index, updated) => {
    const updatedConstraints = [...constraints]
    updatedConstraints[index] = updated
    setConstraints(updatedConstraints)
  }

  const variableCount = constraints[0]?.coeffs?.length || 0

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Constraints</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {constraints.map((c, i) => (
            <ConstraintRow
                key={i}
                index={i}
                coeffs={c.coeffs}
                signs={c.signs}   
                sign={c.sign}
                rhs={c.rhs}
                onChange={handleConstraintChange}
                variableCount={variableCount}
            />
        ))}
      </CardContent>
    </Card>
  )
}
