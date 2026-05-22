import { useEffect, useMemo, useState } from 'react'
import { Sparkles, FileSignature } from 'lucide-react'
import type {
  Customer,
  Destination,
  Fob,
  FreightTerms,
  LoadType,
  Program,
  SalesRep,
  Shipper,
} from '../types'
import { SearchableSelect } from './SearchableSelect'
import { EMPTY_BOL_FORM, type BolFormFields } from '../lib/generateBol'

export interface OrderFormValues {
  programId: string | null
  loadId: string
  loadTypeId: string | null
  fobId: string | null
  shippingCost: string
  customerId: string | null
  destinationId: string | null
  salesRepId: string | null
  notifyCustomer: boolean
  notifyAm: boolean
  createBol: boolean
  shipperId: string | null
  bolForm: BolFormFields
}

interface Props {
  programs: Program[]
  customers: Customer[]
  destinations: Destination[]
  fobs: Fob[]
  loadTypes: LoadType[]
  salesReps: SalesRep[]
  shippers: Shipper[]
  onSubmit: (values: OrderFormValues) => void
}

const empty: OrderFormValues = {
  programId: null,
  loadId: '',
  loadTypeId: null,
  fobId: null,
  shippingCost: '',
  customerId: null,
  destinationId: null,
  salesRepId: null,
  notifyCustomer: false,
  notifyAm: false,
  createBol: false,
  shipperId: null,
  bolForm: { ...EMPTY_BOL_FORM },
}

const FREIGHT_TERMS: FreightTerms[] = ['Prepaid', 'Collect', '3rd Party']

export function OrderForm({
  programs,
  customers,
  destinations,
  fobs,
  loadTypes,
  salesReps,
  shippers,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<OrderFormValues>(empty)

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === values.programId) ?? null,
    [programs, values.programId],
  )
  const programHasLoadTypes = selectedProgram?.has_load_types ?? true

  const customerDestinations = useMemo(
    () =>
      values.customerId
        ? destinations.filter((d) => d.customer_id === values.customerId && d.active)
        : [],
    [destinations, values.customerId],
  )

  useEffect(() => {
    if (selectedProgram && !selectedProgram.has_load_types && values.loadTypeId !== null) {
      setValues((v) => ({ ...v, loadTypeId: null }))
    }
  }, [selectedProgram, values.loadTypeId])

  useEffect(() => {
    if (!values.customerId) return
    const customer = customers.find((c) => c.id === values.customerId)
    setValues((v) => {
      const next = { ...v }
      if (customerDestinations.length === 1 && !next.destinationId) {
        next.destinationId = customerDestinations[0].id
      }
      if (customer?.default_sales_rep_id && !next.salesRepId) {
        next.salesRepId = customer.default_sales_rep_id
      }
      return next
    })
  }, [values.customerId, customerDestinations, customers])

  const canSubmit =
    values.programId !== null &&
    values.fobId !== null &&
    values.customerId !== null &&
    (!programHasLoadTypes || values.loadTypeId !== null) &&
    (customerDestinations.length === 0 || values.destinationId !== null) &&
    (!values.createBol || values.shipperId !== null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(values)
  }

  function updBol<K extends keyof BolFormFields>(key: K, val: BolFormFields[K]) {
    setValues((v) => ({ ...v, bolForm: { ...v.bolForm, [key]: val } }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-via-card rounded-xl border border-via-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
          Load details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="Parent SKU *"
            placeholder="Pick a program (Load-WYF, Load-WM…)"
            value={values.programId}
            onChange={(v) => setValues((s) => ({ ...s, programId: v }))}
            options={programs
              .filter((p) => p.active)
              .map((p) => ({
                value: p.id,
                label: p.name,
                sublabel: p.has_load_types ? 'Uses Load Type' : 'No Load Type',
              }))}
          />
          <TextField
            label="Load ID"
            value={values.loadId}
            onChange={(v) => setValues((s) => ({ ...s, loadId: v }))}
            placeholder="Optional — e.g. 50483"
          />
          {programHasLoadTypes ? (
            <SearchableSelect
              label="Load Type *"
              placeholder="Pick load type"
              value={values.loadTypeId}
              onChange={(v) => setValues((s) => ({ ...s, loadTypeId: v }))}
              options={loadTypes
                .filter((l) => l.active)
                .map((l) => ({ value: l.id, label: l.name, sublabel: `Code: ${l.code}` }))}
            />
          ) : (
            <DisabledField
              label="Load Type"
              hint={`Not used for ${selectedProgram?.name ?? 'this program'}`}
            />
          )}
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
          Invoice information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="Customer name *"
            placeholder="Search by name…"
            value={values.customerId}
            onChange={(v) =>
              setValues((s) => ({ ...s, customerId: v, destinationId: null, salesRepId: null }))
            }
            options={customers
              .filter((c) => c.active)
              .map((c) => ({
                value: c.id,
                label: c.display_name,
                sublabel: c.company ?? undefined,
              }))}
          />
          {values.customerId && customerDestinations.length === 0 ? (
            <DisabledField
              label="Destination"
              hint="This customer has no destinations — add one in Admin."
              warn
            />
          ) : (
            <SearchableSelect
              label="Destination"
              placeholder={values.customerId ? 'Pick destination' : 'Pick a customer first'}
              value={values.destinationId}
              onChange={(v) => setValues((s) => ({ ...s, destinationId: v }))}
              options={customerDestinations.map((d) => ({
                value: d.id,
                label: d.label,
                sublabel: [d.city, d.state, d.zip].filter(Boolean).join(' · '),
              }))}
            />
          )}
          <SearchableSelect
            label="Account Manager"
            placeholder="Defaults to customer's rep"
            value={values.salesRepId}
            onChange={(v) => setValues((s) => ({ ...s, salesRepId: v }))}
            options={salesReps
              .filter((r) => r.active)
              .map((r) => ({ value: r.id, label: r.name }))}
          />
        </div>
      </section>

      <section className="bg-via-card rounded-xl border border-via-border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
          Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <CheckOption
            label="Notify Customer"
            description="Flag a customer notification (email preview shown on the invoice)."
            checked={values.notifyCustomer}
            onChange={(v) => setValues((s) => ({ ...s, notifyCustomer: v }))}
          />
          <CheckOption
            label="Notify AM"
            description="Flag a heads-up to the account manager."
            checked={values.notifyAm}
            onChange={(v) => setValues((s) => ({ ...s, notifyAm: v }))}
          />
          <CheckOption
            label="Create BOL"
            description="Generate a Bill of Lading alongside the invoice."
            checked={values.createBol}
            onChange={(v) => setValues((s) => ({ ...s, createBol: v }))}
          />
        </div>
      </section>

      {values.createBol && (
        <section className="bg-via-card rounded-xl border-2 border-via-orange/40 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-via-orange" />
            <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
              Bill of Lading
            </h2>
          </div>
          <p className="text-xs text-via-text-light -mt-2">
            Ship-To pulls from the selected Customer + Destination. Pick a Shipper for Ship-From, then fill the carrier + freight info.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              label="Shipper (Ship From) *"
              placeholder="Type shipper name…"
              value={values.shipperId}
              onChange={(v) => setValues((s) => ({ ...s, shipperId: v }))}
              options={shippers
                .filter((s) => s.active)
                .map((s) => ({
                  value: s.id,
                  label: s.name,
                  sublabel: [s.city, s.state].filter(Boolean).join(', ') || undefined,
                }))}
            />
            <TextField
              label="Carrier Name"
              value={values.bolForm.carrierName}
              onChange={(v) => updBol('carrierName', v)}
              placeholder="e.g. Santa Fe"
            />
            <TextField
              label="Trailer Number"
              value={values.bolForm.trailerNumber}
              onChange={(v) => updBol('trailerNumber', v)}
              placeholder="247"
            />
            <TextField
              label="Seal Number"
              value={values.bolForm.sealNumber}
              onChange={(v) => updBol('sealNumber', v)}
              placeholder="64671074"
            />
            <TextField
              label="SCAC"
              value={values.bolForm.scac}
              onChange={(v) => updBol('scac', v)}
              placeholder="Optional"
            />
            <div>
              <span className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
                Freight Charge Terms
              </span>
              <div className="flex gap-2">
                {FREIGHT_TERMS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updBol('freightTerms', t)}
                    className={`px-3 py-2 text-sm rounded-lg border ${
                      values.bolForm.freightTerms === t
                        ? 'bg-via-navy text-white border-via-navy'
                        : 'bg-white text-via-text border-via-border hover:bg-via-card'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <TextField
              label="# of Pallets"
              value={values.bolForm.palletCount}
              onChange={(v) => updBol('palletCount', v)}
              placeholder="24"
              inputMode="numeric"
            />
            <TextField
              label="# of Packages"
              value={values.bolForm.packageCount}
              onChange={(v) => updBol('packageCount', v)}
              placeholder="24"
              inputMode="numeric"
            />
            <TextField
              label="Total Weight (lb)"
              value={values.bolForm.totalWeight}
              onChange={(v) => updBol('totalWeight', v)}
              placeholder="14400"
              inputMode="numeric"
            />
            <div className="md:col-span-2">
              <span className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
                Commodity Description
              </span>
              <textarea
                value={values.bolForm.commodityDescription}
                onChange={(e) => updBol('commodityDescription', e.target.value)}
                placeholder="e.g. Mixed household goods — Wayfair LQ pallets"
                rows={2}
                className="w-full px-3 py-2 bg-white border border-via-border rounded-lg text-sm text-via-text focus:outline-none focus:ring-2 focus:ring-via-navy/30"
              />
            </div>
            <div className="md:col-span-2">
              <span className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
                Special Instructions
              </span>
              <textarea
                value={values.bolForm.specialInstructions}
                onChange={(e) => updBol('specialInstructions', e.target.value)}
                placeholder="Optional"
                rows={2}
                className="w-full px-3 py-2 bg-white border border-via-border rounded-lg text-sm text-via-text focus:outline-none focus:ring-2 focus:ring-via-navy/30"
              />
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-via-orange text-white font-semibold text-sm rounded-lg hover:bg-via-orange-light disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          {values.createBol ? 'Generate Invoice & BOL' : 'Generate Sample Invoice'}
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

function DisabledField({ label, hint, warn }: { label: string; hint: string; warn?: boolean }) {
  return (
    <div className="block">
      <span className="block text-xs font-semibold text-via-text uppercase tracking-wide mb-1.5">
        {label}
      </span>
      <div
        title={hint}
        className="w-full px-3 py-2 bg-slate-100 border border-via-border rounded-lg text-sm text-via-text-light cursor-not-allowed select-none"
      >
        — {hint}
      </div>
      {warn && <p className="mt-1 text-xs text-amber-700">{hint}</p>}
    </div>
  )
}

function CheckOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border bg-white cursor-pointer transition-colors ${
        checked ? 'border-via-navy ring-1 ring-via-navy/20' : 'border-via-border hover:bg-via-card/40'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 accent-via-navy shrink-0"
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-via-text">{label}</div>
        <div className="text-xs text-via-text-light leading-snug">{description}</div>
      </div>
    </label>
  )
}
