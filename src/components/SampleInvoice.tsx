import { CheckCircle2 } from 'lucide-react'
import type { InvoicePayload } from '../types'

interface Props {
  invoice: InvoicePayload
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function SampleInvoice({ invoice }: Props) {
  const subtotal = invoice.parent_sku_cost + (invoice.shipping_cost ?? 0)
  const skuMain = invoice.parent_sku_full ?? invoice.parent_sku_label
  const lineItemSubLabel = invoice.parent_sku_full
    ? [invoice.parent_sku_label, invoice.load_type, invoice.fob].filter(Boolean).join(' · ')
    : [invoice.load_type, invoice.fob].filter(Boolean).join(' · ')

  return (
    <div className="bg-white rounded-md border border-via-border shadow-sm print-card overflow-hidden">
      {/* Top header */}
      <div className="border-b border-via-border px-6 py-4 flex items-center justify-between gap-3 bg-white">
        <h2 className="text-3xl font-semibold text-via-navy tracking-tight">
          Order <span className="font-mono">#{invoice.order_number}</span>
        </h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Order Submitted
        </span>
      </div>

      {/* Order facts strip */}
      <div className="bg-slate-50 border-b border-via-border px-6 py-3 grid grid-cols-2 md:grid-cols-6 gap-y-2 gap-x-4 text-sm">
        <Pair label="Date" value={new Date(invoice.generated_at).toLocaleDateString()} />
        <Pair label="Program" value={invoice.program_name} mono />
        <Pair label="Load Type" value={invoice.load_type ?? '—'} />
        <Pair label="FOB" value={invoice.fob} />
        <Pair label="Customer" value={invoice.customer_display_name} />
        <Pair label="Parent SKU" value={skuMain} mono />
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        <Card title="Customer">
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <Field label="Customer Name" value={invoice.customer_display_name} highlight span={2} />
            <Field label="Destination" value={invoice.destination_label} highlight span={2} />
            <Field label="First Name" value={invoice.first_name} />
            <Field label="Last Name" value={invoice.last_name} />
            <Field label="Company" value={invoice.company} span={2} />
            <Field label="Address 1" value={invoice.address1} span={2} />
            <Field label="Address 2" value={invoice.address2} span={2} />
            <Field label="City" value={invoice.city} />
            <Field label="State" value={invoice.state} />
            <Field label="Zip" value={invoice.zip} />
            <Field label="PT Buyer ID" value={invoice.pt_buyer_id} mono />
          </div>
        </Card>

        <Card title="Account">
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <Field label="Account Manager" value={invoice.account_manager} highlight span={2} />
            <Field label="Order Type" value={invoice.order_type} highlight span={2} />
            <Field label="Payment Type" value={invoice.payment_type} />
            <Field label="Taxable" value="No" />
            <Field label="Direct Shipping" value={invoice.direct_shipping ? 'Yes' : 'No'} highlight />
            <Field label="Processed By" value={invoice.account_manager} />
          </div>
        </Card>

        <Card title="Shipping">
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <Field label="Carrier" value={invoice.carrier} span={2} />
            <Field label="Shipping Cost" value={fmtMoney(invoice.shipping_cost)} mono />
            {invoice.load_id && <Field label="Load ID" value={invoice.load_id} mono />}
          </div>
        </Card>

        <Card title="Line Items">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-via-text-light uppercase tracking-wide border-b border-via-border">
                <th className="pb-2 pr-2">SKU</th>
                <th className="pb-2 px-2 text-center">Qty</th>
                <th className="pb-2 pl-2 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-via-border">
                <td className="py-2 pr-2 text-via-text">
                  <span className="font-mono text-sm text-via-navy">{skuMain}</span>
                  {lineItemSubLabel && (
                    <span className="block text-[11px] text-via-text-light">{lineItemSubLabel}</span>
                  )}
                  <span className="block text-[10px] text-via-text-light italic">
                    {invoice.parent_sku_full
                      ? 'Serialized from Program + FOB + Load Type + Load ID'
                      : 'Parent SKU placeholder — add a Load ID to serialize, or the real SKU is created in ERP'}
                  </span>
                </td>
                <td className="py-2 px-2 text-center text-via-text">1</td>
                <td className="py-2 pl-2 text-right font-mono text-via-text">
                  {fmtMoney(invoice.parent_sku_cost)}
                </td>
              </tr>
              {invoice.shipping_cost != null && (
                <tr className="border-b border-via-border">
                  <td className="py-2 pr-2 text-via-text">Shipping</td>
                  <td className="py-2 px-2 text-center text-via-text-light">—</td>
                  <td className="py-2 pl-2 text-right font-mono text-via-text">
                    {fmtMoney(invoice.shipping_cost)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-3 text-right text-xs uppercase tracking-wide text-via-text-light">
                  Subtotal
                </td>
                <td className="pt-3 text-right font-mono font-semibold text-via-navy">
                  {fmtMoney(subtotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>
      </div>

      <div className="border-t border-via-border bg-slate-50 px-6 py-3 text-xs text-via-text-light">
        Highlighted fields are auto-resolved from the customer record. Parent SKU:
        <span className="font-mono mx-1 text-via-text">{skuMain}</span>
        {invoice.parent_sku_full
          ? '(serialized from Program · FOB · Load Type · Load ID).'
          : '(no Load ID provided — only the program placeholder is shown).'}
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-via-border rounded-md overflow-hidden bg-white">
      <div className="bg-slate-100 border-b border-via-border px-4 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-via-text">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Pair({
  label,
  value,
  mono,
}: {
  label: string
  value: string | null | undefined
  mono?: boolean
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-via-text-light uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-sm text-via-text ${mono ? 'font-mono' : ''}`}>{value || '—'}</div>
    </div>
  )
}

function Field({
  label,
  value,
  highlight,
  mono,
  span,
}: {
  label: string
  value: string | null | undefined
  highlight?: boolean
  mono?: boolean
  span?: 2
}) {
  const display = value && value !== '' ? value : '—'
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <div className="text-[10px] font-semibold text-via-text-light uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div
        className={[
          'text-sm border-b border-slate-200 pb-1',
          mono ? 'font-mono' : '',
          highlight ? 'text-via-navy font-semibold' : 'text-via-text',
          value ? '' : 'text-via-text-light italic',
        ].join(' ')}
      >
        {display}
      </div>
    </div>
  )
}
