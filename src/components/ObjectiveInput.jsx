import React from "react"
import { Input } from "@/components/ui/input"

export default function ObjectiveInput({ objectiveName, setObjectiveName, objectiveCoeffs, setObjectiveCoeffs }) {
  return (
    <div>
      <label className="font-bold">Objective:</label>
      <div className="flex gap-2 mt-1 items-center">
        <Input
          type="text"
          value={objectiveName}
          onChange={e => setObjectiveName(e.target.value)}
          className="w-12"
        />
        <span>=</span>
        {objectiveCoeffs.map((val, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span>+</span>}
            <Input
              type="text"
              placeholder={"value"}
                value={val} 
              onChange={e => {
                const newCoeffs = [...objectiveCoeffs]
                const num = e.target.value.replace(/[^0-9.]/g, "")
                newCoeffs[i] = num === "" ? "" : Number(num)
                setObjectiveCoeffs(newCoeffs)
              }}
              className="w-20"
            />
            <p>x{i + 1}</p>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
