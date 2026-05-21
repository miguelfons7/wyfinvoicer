import { NavLink, useParams } from 'react-router-dom'
import { Settings, RotateCcw } from 'lucide-react'
import { CustomersAdmin } from '../components/admin/CustomersAdmin'
import { SimpleListAdmin } from '../components/admin/SimpleListAdmin'
import { store } from '../lib/storage'

const TABS = [
  { id: 'programs', label: 'Programs' },
  { id: 'customers', label: 'Customers' },
  { id: 'sales-reps', label: 'Sales Reps' },
  { id: 'fobs', label: 'FOBs' },
  { id: 'load-types', label: 'Load Types' },
] as const

export function Admin() {
  const { tab } = useParams<{ tab?: string }>()
  const active = (tab ?? 'programs') as (typeof TABS)[number]['id']

  function resetAll() {
    if (
      !confirm(
        'Reset ALL local data (programs, customers, destinations, FOBs, sales reps, load types, orders)? This cannot be undone.',
      )
    )
      return
    store.resetAll()
    window.location.reload()
  }

  return (
    <div className="max-w-6xl">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-via-navy flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-via-navy">Admin</h1>
            <p className="text-sm text-via-text-light">
              Manage the dropdowns the form sees. Saved in this browser only.
            </p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-via-danger border border-via-danger/30 rounded-lg hover:bg-via-danger/5"
        >
          <RotateCcw className="w-4 h-4" /> Reset to seed data
        </button>
      </header>

      <div className="flex items-center gap-1 border-b border-via-border mb-5">
        {TABS.map((t) => (
          <NavLink
            key={t.id}
            to={`/admin/${t.id}`}
            className={() =>
              `px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
                active === t.id
                  ? 'border-via-navy text-via-navy'
                  : 'border-transparent text-via-text-light hover:text-via-text'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {active === 'programs' && (
        <SimpleListAdmin
          title="Programs (Parent SKUs)"
          read={store.getPrograms}
          write={store.setPrograms}
          fields={[
            { key: 'name', label: 'Name (e.g. Load-WYF)', required: true },
            { key: 'code', label: 'Code (e.g. WYF)', required: true, mono: true },
            { key: 'has_load_types', label: 'Has Load Types', type: 'checkbox' },
          ]}
          idPrefix="pgm"
        />
      )}
      {active === 'customers' && <CustomersAdmin />}
      {active === 'sales-reps' && (
        <SimpleListAdmin
          title="Sales Reps"
          read={store.getSalesReps}
          write={store.setSalesReps}
          fields={[{ key: 'name', label: 'Name', required: true }]}
          idPrefix="rep"
        />
      )}
      {active === 'fobs' && (
        <SimpleListAdmin
          title="FOB Locations"
          read={store.getFobs}
          write={store.setFobs}
          fields={[
            { key: 'name', label: 'Name', required: true },
            { key: 'code', label: 'Code (SKU prefix)', required: true, mono: true },
          ]}
          idPrefix="fob"
        />
      )}
      {active === 'load-types' && (
        <SimpleListAdmin
          title="Load Types"
          read={store.getLoadTypes}
          write={store.setLoadTypes}
          fields={[
            { key: 'name', label: 'Name', required: true },
            { key: 'code', label: 'Code (SKU prefix)', required: true, mono: true },
          ]}
          idPrefix="lt"
        />
      )}
    </div>
  )
}
