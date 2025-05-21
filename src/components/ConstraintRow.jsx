import React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function ConstraintRow({ index, coeffs = [], signs = [], sign, rhs, onChange, variableCount }) {
  // Handle coefficient change
  const handleCoeffChange = (i, val) => {
    const updatedCoeffs = [...coeffs]
    updatedCoeffs[i] = val
    onChange(index, { coeffs: updatedCoeffs, signs, sign, rhs })
  }

  // Handle plus/minus sign change between variables
  const handleInterSignChange = (i, value) => {
    const updatedSigns = [...signs]
    updatedSigns[i] = value
    onChange(index, { coeffs, signs: updatedSigns, sign, rhs })
  }

  // Handle constraint sign change (<=, >=, =)
  const handleSignChange = value => {
    onChange(index, { coeffs, signs, sign: value, rhs })
  }

  // Handle RHS change
  const handleRHSChange = e => {
    onChange(index, { coeffs, signs, sign, rhs: e.target.value })
  }

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: variableCount }).map((_, i) => (
        <React.Fragment key={i}>
              <div className="flex items-center gap-1">
                  <Input
                      type="text"
                      value={coeffs[i] || ""}
                      onChange={e => handleCoeffChange(i, e.target.value)}
                      placeholder="value"
                      className="w-16 text-center"
                  />
                  <span className="text-sm text-muted-foreground">x{i + 1}</span>
              </div>
          {i < variableCount - 1 && (
              <Select
               value={signs[i] ?? "+"}
                onValueChange={value => handleInterSignChange(i, value)}
               >
             <SelectTrigger className="w-16">
               <SelectValue />
               </SelectTrigger>
               <SelectContent>
             <SelectItem value="+">+</SelectItem>
             <SelectItem value="-">-</SelectItem>
               </SelectContent>
           </Select>

          )}
        </React.Fragment>
      ))}
       <Select value={sign ?? "<="} onValueChange={handleSignChange}>
         <SelectTrigger className="w-16">
          <SelectValue />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="<=">{"<="}</SelectItem>
           <SelectItem value=">=">{">="}</SelectItem>
           <SelectItem value="=">{"="}</SelectItem>
            </SelectContent>
          </Select>
      <Input
        type="text"
        value={rhs}
        onChange={handleRHSChange}
        placeholder="RHS"
        className="w-20 text-center"
      />
    </div>
  )
}
