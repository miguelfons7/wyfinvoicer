import { useEffect, useState } from 'react'
import { Sparkles, Mail } from 'lucide-react'
import type { Buyer, Fob, LoadType, SalesRep } from '../types'
import { parseLoadEmail } from '../lib/parseLoadEmail'
import { SearchableSelect } from './SearchableSelect'

export interface OrderFormValues {
  loadId: string
  loadTypeId: string | null
  trailer: string
  seal: string
  po: string
  fobId: string | null
  shippingCost: string
  buyerId: string | null
  salesRepId: string | null
}

interface Props {
  buyers: Buyer[]
  fobs: Fob[]
  loadTypes: LoadType[]
  salesReps: SalesRep[]
  onSubmit: (values: OrderFormValues) => void
}

const empty: OrderFormValues = {
  loadId: '',
  loadTypeId: null,
  trailer: '',
  seal: '',
  po: '',
  fobId: null,
  shippingCost: '',
  buyerId: null,
  salesRepId: null,
}

export function OrderForm({ buyers, fobs, loadTypes, salesReps, onSubmit }: Props) {
  const [emailText, setEmailText] = useState('')
  const [values, setValues] = useState<OrderFormValues>(empty)
  const [parseInfo, setParseInfo] = useState<string | null>(null)

  // When a buyer is selected, default the sales rep to that buyer's default
  useEffect(() => {
    if (!values.buyerId) return
    const buyer = buyers.find((b) => b.id === values.buyerId)
    if (buyer?.default_sales_rep_id && !values.salesRepId) {
      setValues((v) => ({ ...v, salesRepId: buyer.default_sales_rep_id }))
    }
  }, [values.buyerId, values.salesRepId, buyers])

  function applyParsed() {
    const parsed = parseLoadEmail(emailText)
    let matched = 0
    setValues((v) => {
      const next = { ...v }
      if (parsed.loadId) { next.loadId = parsed.loadId; matched++ }
      if (parsed.trailer) { next.trailer = parsed.trailer; matched++ }
      if (parsed.seal) { next.seal = parsed.seal; matched++ }
      if (parsed.po) { next.po = parsed.po; matched++ }
      if (parsed.loadType) {
        const lt = loadTypes.find(
          (l) =>
            l.code.toLowerCase() === parsed.loadType!.toLowerCase() ||
            l.name.toLowerCase() === parsed.loadType!.toLowerCase(),
        )
        if (lt) { next.loadTypeId = lt.id; matched++ }
      }
      return next
    })
    setParseInfo(
      matched > 0
        ? `Filled ${matched} field${matched === 1 ? '' : 's'}.`
        : 'No load fields detected.',
    )
  }

  const canSubmit =
    values.loadId.trim() !== '' &&
    values.loadTypeId !== null &&
    values.fobId !== null &&
    values.buyerId !== null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-via-card rounded-xl border border-via-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-via-navy" />
          <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
            Paste the Wayfair email (optional)
          </h2>
        </div>
        <p className="text-xs text-via-text-light mb-3">
          Drop in the email body — we'll extract Load ID, Load Type, Trailer, Seal, and PO.
        </p>
        <textarea
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
          placeholder={`This trailer is ready to be swapped out from Romeoville:\n\nLoad ID: 50427 (Salvage)\nTrailer #: 247\nSeal #: 64671074`}
          rows={6}
          className="w-full px-3 py-2 bg-white border border-via-border rounded-lg text-sm font-mono text-via-text focus:outline-none focus:ring-2 focus:ring-via-navy/30"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-via-text-light">{parseInfo ?? ' '}</span>
          <button
            type="button"
            onClick={applyParsed}
            disabled={!emailText.trim()}
            className="px-3 py-1.5 bg-via-navy text-white text-sm rounded-lg hover:bg-via-navy-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Auto-fill from email
          </button>
        </div>
      </section>

      <section className="bg-via-card rounded-xl border border-via-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
          Load details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Load ID *"
            value={values.loadId}
            onChange={(v) => setValues((s) => ({ ...s, loadId: v }))}
            placeholder="50427"
          />
          <SearchableSelect
            label="Load Type *"
            placeholder="Pick load type"
            value={values.loadTypeId}
            onChange={(v) => setValues((s) => ({ ...s, loadTypeId: v }))}
            options={loadTypes
              .filter((l) => l.active)
              .map((l) => ({ value: l.id, label: l.name, sublabel: `Code: ${l.code}` }))}
          />
          <SearchableSelect
            label="FOB *"
            placeholder="Pick FOB location"
            value={values.fobId}
            onChange={(v) => setValues((s) => ({ ...s, fobId: v }))}
            options={fobs
              .filter((f) => f.active)
              .map((f) => ({ value: f.id, label: f.name, sublabel: `Code: ${f.code}` }))}
          />
          <TextField
            label="Trailer #"
            value={values.trailer}
            onChange={(v) => setValues((s) => ({ ...s, trailer: v }))}
            placeholder="247"
          />
          <TextField
            label="Seal"
            value={values.seal}
            onChange={(v) => setValues((s) => ({ ...s, seal: v }))}
            placeholder="64671074"
          />
          <TextField
            label="PO #"
            value={values.po}
            onChange={(v) => setValues((s) => ({ ...s, po: v }))}
            placeholder="554124763LIQ"
          />
          <TextField
            label="Shipping Cost"
            value={values.shippingCost}
            onChange={(v) => setValues((s) => ({ ...s, shippingCost: v }))}
            placeholder="1800"
            prefix="$"
            inputMode="decimal"
          />
        </div>
      </section>

      <section className="bg-via-card rounded-xl border border-via-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
          Buyer & sales rep
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="Buyer *"
            placeholder="Search by name…"
            value={values.buyerId}
            onChange={(v) => setValues((s) => ({ ...s, buyerId: v, salesRepId: null }))}
            options={buyers
              .filter((b) => b.active)
              .map((b) => ({
                value: b.id,
                label: b.display_name,
                sublabel: [b.company, b.city, b.state].filter(Boolean).join(' · '),
              }))}
          />
          <SearchableSelect
            label="Sales Rep / Account Manager"
            placeholder="Defaults from buyer if blank"
            value={values.salesRepId}
            onChange={(v) => setValues((s) => ({ ...s, salesRepId: v }))}
            options={salesReps
              .filter((r) => r.active)
              .map((r) => ({ value: r.id, label: r.name }))}
          />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-via-orange text-white font-semibold text-sm rounded-lg hover:bg-via-orange-light disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          Generate Sample Invoice
        </button>
      </div>
    </form>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  prefix?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
        {label}
      </span>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-via-text-light pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={value}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${prefix ? 'pl-7' : 'pl-3'} pr-3 py-2 bg-white border border-via-border rounded-lg text-sm text-via-text focus:outline-none focus:ring-2 focus:ring-via-navy/30`}
        />
      </div>
    </label>
  )
}
