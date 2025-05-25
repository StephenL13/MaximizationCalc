import React from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

export default function ConstraintRow({
  index,
  coeffs = [],
  signs = [],
  sign,
  rhsSign = "+",
  rhs,
  onChange,
  variableCount,
}) {
  // helper to emit the full constraint object
  const emit = (updates) => {
    onChange(index, {
      coeffs,
      signs,
      sign,
      rhsSign,
      rhs,
      ...updates,
    })
  }

  // Update one coefficient
  const handleCoeffChange = (i, val) => {
    const updated = [...coeffs]
    updated[i] = val
    emit({ coeffs: updated })
  }

  // Update the sign in front of xᵢ
  const handleTermSignChange = (i, value) => {
    const updated = [...signs]
    updated[i] = value
    emit({ signs: updated })
  }

  // Update the ≤/≥/= selector
  const handleRelationChange = (value) => {
    emit({ sign: value })
  }

  // Update RHS
  const handleRHSChange = (e) => {
    emit({ rhs: e.target.value })
  }

  // Update RHS sign
  const handleRhsSignChange = (value) => {
    emit({ rhsSign: value })
  }

  return (
    <div className="w-full space-y-3">
      {/* 1) Terms row */}
      <div className="flex flex-wrap items-center gap-2">
        {coeffs.map((c, i) => (
          <React.Fragment key={i}>
            {/* term sign dropdown */}
            <Select
              value={signs[i] ?? "+"}
              onValueChange={(v) => handleTermSignChange(i, v)}
            >
              <SelectTrigger className="w-15 h-10 flex items-center justify-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="py-1">
                <SelectItem value="+">+</SelectItem>
                <SelectItem value="-">−</SelectItem>
              </SelectContent>
            </Select>

            {/* numeric coefficient */}
            <Input
              type="number"
              step="any"
              min="0"
              value={c}
              onKeyDown={(e) => {
                // block scientific e, plus, minus
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault()
              }}
              onChange={(e) => handleCoeffChange(i, e.target.value)}
              placeholder="value"
              className="w-20 text-center"
            />

            {/* variable label */}
            <span className="text-sm text-muted-foreground pr-2">
              {`x${i + 1}`}
              {i + 1 < 10 && "\u00A0"}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* 2) Relation + RHS row */}
      <div className="w-full flex items-center gap-2">
        <Select value={sign} onValueChange={handleRelationChange}>
          <SelectTrigger className="w-15 h-10 flex items-center justify-center">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="py-1">
            <SelectItem value="<=">{"≤"}</SelectItem>
            <SelectItem value=">=">{">="}</SelectItem>
            <SelectItem value="=">{"="}</SelectItem>
          </SelectContent>
        </Select>

        {/* RHS sign picker */}
        <Select value={rhsSign} onValueChange={handleRhsSignChange}>
          <SelectTrigger className="w-15 h-10 flex items-center justify-center">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="py-1">
            <SelectItem value="+">+</SelectItem>
            <SelectItem value="-">−</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          step="any"
          value={rhs}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault()
          }}
          onChange={handleRHSChange}
          placeholder="RHS"
          className="flex-1 text-center"
        />
      </div>
    </div>
)
}
