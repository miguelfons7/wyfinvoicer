import { useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { newId } from '../../lib/storage'

interface MinRow {
  id: string
  active: boolean
}

interface Field {
  key: string
  label: string
  required?: boolean
  mono?: boolean
}

interface Props<T extends MinRow> {
  title: string
  read: () => T[]
  write: (rows: T[]) => void
  fields: Field[]
  idPrefix: string
}

export function SimpleListAdmin<T extends MinRow>({
  title,
  read,
  write,
  fields,
  idPrefix,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setRows(read())
  }, [read])

  function update(index: number, key: string, value: unknown) {
    setRows((rs) => {
      const next = [...rs]
      next[index] = { ...next[index], [key]: value } as T
      return next
    })
    setDirty(true)
  }

  function addRow() {
    const blank: Record<string, unknown> = { id: newId(idPrefix), active: true }
    for (const f of fields) blank[f.key] = ''
    setRows((rs) => [...rs, blank as unknown as T])
    setDirty(true)
  }

  function deleteRow(index: number) {
    if (!confirm('Delete this row?')) return
    setRows((rs) => rs.filter((_, i) => i !== index))
    setDirty(true)
  }

  function save() {
    write(rows)
    setDirty(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-via-border rounded-lg hover:bg-via-card"
          >
            <Plus className="w-4 h-4" /> Add row
          </button>
          <button
            onClick={save}
            disabled={!dirty}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-via-navy text-white rounded-lg hover:bg-via-navy-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> {dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-via-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-via-card text-xs uppercase tracking-wide text-via-text-light">
            <tr>
              {fields.map((f) => (
                <th key={f.key} className="text-left px-3 py-2.5">{f.label}</th>
              ))}
              <th className="text-center px-3 py-2.5 w-24">Active</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className="border-t border-via-border">
                {fields.map((f) => (
                  <td key={f.key} className="px-3 py-1.5">
                    <input
                      value={String((row as unknown as Record<string, unknown>)[f.key] ?? '')}
                      onChange={(e) => update(i, f.key, e.target.value)}
                      placeholder={f.required ? 'Required' : ''}
                      className={`w-full px-2 py-1.5 bg-white border border-via-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-via-navy/30 ${
                        f.mono ? 'font-mono' : ''
                      }`}
                    />
                  </td>
                ))}
                <td className="px-3 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) => update(i, 'active', e.target.checked)}
                    className="w-4 h-4 accent-via-navy"
                  />
                </td>
                <td className="px-2 py-1.5 text-right">
                  <button
                    onClick={() => deleteRow(i)}
                    className="p-1.5 text-via-text-light hover:text-via-danger"
                    aria-label="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={fields.length + 2}
                  className="px-3 py-6 text-center text-sm text-via-text-light"
                >
                  No rows yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
