import React from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"

export default function ObjectiveInput({
  objectiveName,
  setObjectiveName,
  objectiveCoeffs,
  objectiveSigns = [],
  setObjectiveCoeffs,
  setObjectiveSigns,
}) {
  return (
    <div>
      <p className="font-bold">Objective Function</p>
      <Card>
        <CardContent className="space-y-2">
          {/* Row 1: Z = */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={objectiveName}
              onChange={(e) => setObjectiveName(e.target.value)}
              className="w-12"
            />
            <span>=</span>
          </div>

          {/* Row 2: term signs + coeff inputs */}
          <div className="flex flex-wrap gap-2 items-center">
            {objectiveCoeffs.map((val, i) => (
              <React.Fragment key={i}>
                {/* + / – dropdown */}
                <Select
                  value={objectiveSigns[i] ?? "+"}
                  onValueChange={(v) => {
                    const updated = [...objectiveSigns]
                    updated[i] = v
                    setObjectiveSigns(updated)
                  }}
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
                  placeholder="value"
                  value={val}
                  onChange={(e) => {
                    const updated = [...objectiveCoeffs]
                    updated[i] = e.target.value
                    setObjectiveCoeffs(updated)
                  }}
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
        </CardContent>
      </Card>
    </div>
  )
}
