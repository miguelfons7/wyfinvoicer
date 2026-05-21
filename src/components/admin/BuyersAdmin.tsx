import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Save, Trash2 } from 'lucide-react'
import { newId, store } from '../../lib/storage'
import type { Buyer, SalesRep } from '../../types'

const emptyBuyer = (): Buyer => ({
  id: newId('buyer'),
  display_name: '',
  first_name: null,
  last_name: null,
  company: null,
  address1: null,
  address2: null,
  city: null,
  state: null,
  zip: null,
  pt_buyer_id: null,
  default_order_type: null,
  default_payment_type: null,
  default_carrier: null,
  default_sales_rep_id: null,
  is_direct_shipping: true,
  active: true,
})

export function BuyersAdmin() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setBuyers(store.getBuyers())
    setSalesReps(store.getSalesReps())
  }, [])

  function update(id: string, patch: Partial<Buyer>) {
    setBuyers((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))
    setDirty(true)
  }
  function addBuyer() {
    const b = emptyBuyer()
    setBuyers((bs) => [...bs, b])
    setExpanded((s) => new Set(s).add(b.id))
    setDirty(true)
  }
  function deleteBuyer(id: string) {
    if (!confirm('Delete this buyer?')) return
    setBuyers((bs) => bs.filter((b) => b.id !== id))
    setDirty(true)
  }
  function toggle(id: string) {
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function save() {
    store.setBuyers(buyers)
    setDirty(false)
  }

  const repName = useMemo(
    () => (id: string | null) => salesReps.find((r) => r.id === id)?.name ?? '—',
    [salesReps],
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
          Buyers
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={addBuyer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-via-border rounded-lg hover:bg-via-card"
          >
            <Plus className="w-4 h-4" /> Add buyer
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
      <div className="space-y-2">
        {buyers.map((b) => {
          const isOpen = expanded.has(b.id)
          return (
            <div key={b.id} className="bg-white border border-via-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(b.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-via-card/40 text-left"
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-via-text-light" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-via-text-light" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-via-text truncate">
                    {b.display_name || '(unnamed buyer)'}
                  </div>
                  <div className="text-xs text-via-text-light truncate">
                    {b.company ?? '—'} · {b.default_order_type ?? 'No program set'} · Rep: {repName(b.default_sales_rep_id)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    b.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {b.active ? 'Active' : 'Inactive'}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-via-border p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField label="Display name *" value={b.display_name} onChange={(v) => update(b.id, { display_name: v })} />
                  <TextField label="Company" value={b.company ?? ''} onChange={(v) => update(b.id, { company: v || null })} />
                  <TextField label="First name" value={b.first_name ?? ''} onChange={(v) => update(b.id, { first_name: v || null })} />
                  <TextField label="Last name" value={b.last_name ?? ''} onChange={(v) => update(b.id, { last_name: v || null })} />
                  <TextField label="Address 1" value={b.address1 ?? ''} onChange={(v) => update(b.id, { address1: v || null })} />
                  <TextField label="Address 2" value={b.address2 ?? ''} onChange={(v) => update(b.id, { address2: v || null })} />
                  <TextField label="City" value={b.city ?? ''} onChange={(v) => update(b.id, { city: v || null })} />
                  <TextField label="State" value={b.state ?? ''} onChange={(v) => update(b.id, { state: v || null })} />
                  <TextField label="Zip" value={b.zip ?? ''} onChange={(v) => update(b.id, { zip: v || null })} />
                  <TextField label="PT Buyer ID" mono value={b.pt_buyer_id ?? ''} onChange={(v) => update(b.id, { pt_buyer_id: v || null })} />
                  <TextField label="Default Order Type (Program)" value={b.default_order_type ?? ''} onChange={(v) => update(b.id, { default_order_type: v || null })} />
                  <TextField label="Default Payment Type" value={b.default_payment_type ?? ''} onChange={(v) => update(b.id, { default_payment_type: v || null })} />
                  <TextField label="Default Carrier" value={b.default_carrier ?? ''} onChange={(v) => update(b.id, { default_carrier: v || null })} />
                  <label className="block">
                    <span className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
                      Default Sales Rep
                    </span>
                    <select
                      value={b.default_sales_rep_id ?? ''}
                      onChange={(e) => update(b.id, { default_sales_rep_id: e.target.value || null })}
                      className="w-full px-3 py-2 bg-white border border-via-border rounded-lg text-sm text-via-text focus:outline-none focus:ring-2 focus:ring-via-navy/30"
                    >
                      <option value="">— None —</option>
                      {salesReps.filter((r) => r.active).map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center gap-6 md:col-span-2 pt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-via-text">
                      <input
                        type="checkbox"
                        checked={b.is_direct_shipping}
                        onChange={(e) => update(b.id, { is_direct_shipping: e.target.checked })}
                        className="w-4 h-4 accent-via-navy"
                      />
                      Direct shipping by default
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-via-text">
                      <input
                        type="checkbox"
                        checked={b.active}
                        onChange={(e) => update(b.id, { active: e.target.checked })}
                        className="w-4 h-4 accent-via-navy"
                      />
                      Active (shown in JR's dropdown)
                    </label>
                    <button
                      onClick={() => deleteBuyer(b.id)}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-via-danger border border-via-danger/30 rounded-lg hover:bg-via-danger/5"
                    >
                      <Trash2 className="w-4 h-4" /> Delete buyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  mono?: boolean
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 bg-white border border-via-border rounded-lg text-sm text-via-text focus:outline-none focus:ring-2 focus:ring-via-navy/30 ${
          mono ? 'font-mono' : ''
        }`}
      />
    </label>
  )
}
