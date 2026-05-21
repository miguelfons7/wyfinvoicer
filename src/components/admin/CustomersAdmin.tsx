import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Save, Trash2 } from 'lucide-react'
import { newId, store } from '../../lib/storage'
import type { Customer, Destination, SalesRep } from '../../types'

const emptyCustomer = (): Customer => ({
  id: newId('cust'),
  display_name: '',
  first_name: null,
  last_name: null,
  company: null,
  pt_buyer_id: null,
  default_order_type: null,
  default_payment_type: null,
  default_carrier: null,
  default_sales_rep_id: null,
  is_direct_shipping: true,
  active: true,
})

const emptyDestination = (customerId: string): Destination => ({
  id: newId('dst'),
  customer_id: customerId,
  label: '',
  address1: null,
  address2: null,
  city: null,
  state: null,
  zip: null,
  active: true,
})

export function CustomersAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setCustomers(store.getCustomers())
    setDestinations(store.getDestinations())
    setSalesReps(store.getSalesReps())
  }, [])

  function updateCustomer(id: string, patch: Partial<Customer>) {
    setCustomers((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    setDirty(true)
  }
  function addCustomer() {
    const c = emptyCustomer()
    setCustomers((cs) => [...cs, c])
    setExpanded((s) => new Set(s).add(c.id))
    setDirty(true)
  }
  function deleteCustomer(id: string) {
    if (!confirm('Delete this customer and ALL its destinations?')) return
    setCustomers((cs) => cs.filter((c) => c.id !== id))
    setDestinations((ds) => ds.filter((d) => d.customer_id !== id))
    setDirty(true)
  }

  function addDestination(customerId: string) {
    setDestinations((ds) => [...ds, emptyDestination(customerId)])
    setDirty(true)
  }
  function updateDestination(id: string, patch: Partial<Destination>) {
    setDestinations((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)))
    setDirty(true)
  }
  function deleteDestination(id: string) {
    if (!confirm('Delete this destination?')) return
    setDestinations((ds) => ds.filter((d) => d.id !== id))
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
    store.setCustomers(customers)
    store.setDestinations(destinations)
    setDirty(false)
  }

  const repName = useMemo(
    () => (id: string | null) => salesReps.find((r) => r.id === id)?.name ?? '—',
    [salesReps],
  )

  const destsByCustomer = useMemo(() => {
    const map: Record<string, Destination[]> = {}
    for (const d of destinations) {
      (map[d.customer_id] ||= []).push(d)
    }
    return map
  }, [destinations])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
          Customers
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={addCustomer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-via-border rounded-lg hover:bg-via-card"
          >
            <Plus className="w-4 h-4" /> Add customer
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
        {customers.map((c) => {
          const isOpen = expanded.has(c.id)
          const dests = destsByCustomer[c.id] ?? []
          return (
            <div key={c.id} className="bg-white border border-via-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(c.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-via-card/40 text-left"
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-via-text-light" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-via-text-light" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-via-text truncate">
                    {c.display_name || '(unnamed customer)'}
                  </div>
                  <div className="text-xs text-via-text-light truncate">
                    {c.company ?? '—'} · Rep: {repName(c.default_sales_rep_id)} ·{' '}
                    {dests.length} destination{dests.length === 1 ? '' : 's'}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {c.active ? 'Active' : 'Inactive'}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-via-border p-4 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField label="Display name *" value={c.display_name} onChange={(v) => updateCustomer(c.id, { display_name: v })} />
                    <TextField label="Company" value={c.company ?? ''} onChange={(v) => updateCustomer(c.id, { company: v || null })} />
                    <TextField label="First name" value={c.first_name ?? ''} onChange={(v) => updateCustomer(c.id, { first_name: v || null })} />
                    <TextField label="Last name" value={c.last_name ?? ''} onChange={(v) => updateCustomer(c.id, { last_name: v || null })} />
                    <TextField label="PT Buyer ID" mono value={c.pt_buyer_id ?? ''} onChange={(v) => updateCustomer(c.id, { pt_buyer_id: v || null })} />
                    <TextField label="Default Order Type (Program)" value={c.default_order_type ?? ''} onChange={(v) => updateCustomer(c.id, { default_order_type: v || null })} />
                    <TextField label="Default Payment Type" value={c.default_payment_type ?? ''} onChange={(v) => updateCustomer(c.id, { default_payment_type: v || null })} />
                    <TextField label="Default Carrier" value={c.default_carrier ?? ''} onChange={(v) => updateCustomer(c.id, { default_carrier: v || null })} />
                    <label className="block">
                      <span className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
                        Default Account Manager
                      </span>
                      <select
                        value={c.default_sales_rep_id ?? ''}
                        onChange={(e) => updateCustomer(c.id, { default_sales_rep_id: e.target.value || null })}
                        className="w-full px-3 py-2 bg-white border border-via-border rounded-lg text-sm text-via-text focus:outline-none focus:ring-2 focus:ring-via-navy/30"
                      >
                        <option value="">— None —</option>
                        {salesReps.filter((r) => r.active).map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-via-navy uppercase tracking-wide">
                        Destinations ({dests.length})
                      </h3>
                      <button
                        onClick={() => addDestination(c.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border border-via-border rounded hover:bg-via-card"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add destination
                      </button>
                    </div>
                    <div className="bg-via-bg-subtle/30 border border-via-border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="text-[10px] uppercase tracking-wide text-via-text-light bg-slate-100">
                          <tr>
                            <th className="text-left px-2 py-1.5">Label *</th>
                            <th className="text-left px-2 py-1.5">Address 1</th>
                            <th className="text-left px-2 py-1.5">City</th>
                            <th className="text-left px-2 py-1.5">State</th>
                            <th className="text-left px-2 py-1.5">Zip</th>
                            <th className="text-center px-2 py-1.5 w-16">Active</th>
                            <th className="w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {dests.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-2 py-3 text-center text-xs text-via-text-light">
                                No destinations yet — add one to make this customer pickable.
                              </td>
                            </tr>
                          )}
                          {dests.map((d) => (
                            <tr key={d.id} className="border-t border-via-border">
                              <td className="px-2 py-1">
                                <input
                                  value={d.label}
                                  onChange={(e) => updateDestination(d.id, { label: e.target.value })}
                                  placeholder="Phx AZ"
                                  className="w-full px-2 py-1 bg-white border border-via-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-via-navy/30"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  value={d.address1 ?? ''}
                                  onChange={(e) => updateDestination(d.id, { address1: e.target.value || null })}
                                  className="w-full px-2 py-1 bg-white border border-via-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-via-navy/30"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  value={d.city ?? ''}
                                  onChange={(e) => updateDestination(d.id, { city: e.target.value || null })}
                                  className="w-full px-2 py-1 bg-white border border-via-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-via-navy/30"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  value={d.state ?? ''}
                                  onChange={(e) => updateDestination(d.id, { state: e.target.value || null })}
                                  className="w-full px-2 py-1 bg-white border border-via-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-via-navy/30"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  value={d.zip ?? ''}
                                  onChange={(e) => updateDestination(d.id, { zip: e.target.value || null })}
                                  className="w-full px-2 py-1 bg-white border border-via-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-via-navy/30"
                                />
                              </td>
                              <td className="px-2 py-1 text-center">
                                <input
                                  type="checkbox"
                                  checked={d.active}
                                  onChange={(e) => updateDestination(d.id, { active: e.target.checked })}
                                  className="w-3.5 h-3.5 accent-via-navy"
                                />
                              </td>
                              <td className="px-1 py-1 text-right">
                                <button
                                  onClick={() => deleteDestination(d.id)}
                                  className="p-1 text-via-text-light hover:text-via-danger"
                                  aria-label="Delete destination"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="inline-flex items-center gap-2 text-sm text-via-text">
                      <input
                        type="checkbox"
                        checked={c.is_direct_shipping}
                        onChange={(e) => updateCustomer(c.id, { is_direct_shipping: e.target.checked })}
                        className="w-4 h-4 accent-via-navy"
                      />
                      Direct shipping by default
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-via-text">
                      <input
                        type="checkbox"
                        checked={c.active}
                        onChange={(e) => updateCustomer(c.id, { active: e.target.checked })}
                        className="w-4 h-4 accent-via-navy"
                      />
                      Active (shown in New Order)
                    </label>
                    <button
                      onClick={() => deleteCustomer(c.id)}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-via-danger border border-via-danger/30 rounded-lg hover:bg-via-danger/5"
                    >
                      <Trash2 className="w-4 h-4" /> Delete customer
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
