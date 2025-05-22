// src/components/TableauDisplay.jsx
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table"
import "./Table.css"

export default function TableauDisplay({ tableau }) {
  if (!tableau || !tableau.headers || !tableau.rows) return null

  const {
    headers,
    rows,
    basis = [],
    cb = [],
    cj = [],
    zj = [],
    zjMinusCj = [],
    qi = [],
    pivot = {}
  } = tableau

  const { pivotCol, pivotRow } = pivot

  const rhsIndex = headers.findIndex(h => h.toLowerCase() === "rhs")

  // build a mask of which columns we actually render
  const visibleIndex = headers.map((h, i) => {
    if (i === rhsIndex) return false
    if (h.startsWith("a") && !basis.includes(h)) return false
    return true
  })

  return (
    <div className="mt-6 overflow-auto">
      <Table>
        <TableHeader>
          {/* Cⱼ row */}
          <TableRow className="bg-muted font-semibold">
            <TableCell colSpan={3} className="text-center">
              c<sub>j</sub>
            </TableCell>
            {cj.map((val, i) =>
              visibleIndex[i] ? (
                <TableCell
                  key={i}
                  className={
                    "text-center " +
                    (i === pivotCol ? "bg-yellow-100" : "")
                  }
                >
                  {val}
                </TableCell>
              ) : null
            )}
            <TableCell className="text-center">-</TableCell>
          </TableRow>

          {/* Column headings */}
          <TableRow>
            <TableHead className="text-center">Ci</TableHead>
            <TableHead className="text-center">Solution</TableHead>
            <TableHead className="text-center">Q</TableHead>
            {headers.map((h, i) =>
              visibleIndex[i] ? (
                <TableHead
                  key={i}
                  className={
                    "text-center " +
                    (i === pivotCol ? "bg-yellow-100" : "")
                  }
                >
                  {h}
                </TableHead>
              ) : null
            )}
            <TableHead className="text-center">Qᵢ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={i}
              className={i === pivotRow ? "bg-yellow-50" : ""}
            >
              <TableCell className="text-center">{cb[i]}</TableCell>
              <TableCell className="text-center">{basis[i]}</TableCell>
              <TableCell className="text-center">{row[rhsIndex]}</TableCell>
              {row.map((val, j) =>
                visibleIndex[j] ? (
                  <TableCell
                    key={j}
                    className={
                      "text-center " +
                      (j === pivotCol && i === pivotRow
                        ? "bg-yellow-300"
                        : j === pivotCol
                        ? "bg-yellow-100"
                        : "")
                    }
                  >
                    {val}
                  </TableCell>
                ) : null
              )}
              <TableCell className="text-center">{qi[i] ?? "-"}</TableCell>
            </TableRow>
          ))}

          {/* Zⱼ row */}
          <TableRow className="bg-muted font-semibold">
            <TableCell colSpan={3} className="text-center">
              Z<sub>j</sub>
            </TableCell>
            {zj.map((val, i) =>
              visibleIndex[i] ? (
                <TableCell
                  key={i}
                  className={
                    "text-center " +
                    (i === pivotCol ? "bg-yellow-100" : "")
                  }
                >
                  {val}
                </TableCell>
              ) : null
            )}
            <TableCell className="text-center">-</TableCell>
          </TableRow>

          {/* Zⱼ – Cⱼ row */}
          <TableRow className="bg-muted font-semibold">
            <TableCell colSpan={3} className="text-center">
              Z<sub>j</sub> – C<sub>j</sub>
            </TableCell>
            {zjMinusCj.map((val, i) =>
              visibleIndex[i] ? (
                <TableCell
                  key={i}
                  className={
                    "text-center " +
                    (i === pivotCol ? "bg-yellow-100" : "")
                  }
                >
                  {val}
                </TableCell>
              ) : null
            )}
            <TableCell className="text-center">-</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {tableau.infeasible && (
        <p className="mt-4 text-center text-red-500 font-semibold">
          Solution is not feasible
        </p>
      )}
    </div>
  )
}
