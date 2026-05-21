import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

export interface SearchableOption {
  value: string
  label: string
  sublabel?: string
}

interface Props {
  options: SearchableOption[]
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  emptyText?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  label,
  emptyText = 'No matches',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel?.toLowerCase().includes(q) ?? false),
    )
  }, [query, options])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-via-border rounded-lg text-sm text-via-text hover:border-via-navy focus:outline-none focus:ring-2 focus:ring-via-navy/30"
      >
        <span className={selected ? '' : 'text-via-text-light'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-via-text-light shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-via-border rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-via-border">
            <Search className="w-4 h-4 text-via-text-light" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 text-sm bg-transparent focus:outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-via-text-light">{emptyText}</li>
            )}
            {filtered.map((o) => {
              const isSelected = o.value === value
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 hover:bg-via-card ${
                      isSelected ? 'bg-via-card' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-via-text truncate">{o.label}</div>
                      {o.sublabel && (
                        <div className="text-xs text-via-text-light truncate">
                          {o.sublabel}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-via-navy shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
