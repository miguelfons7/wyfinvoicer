import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Printer, Trash2 } from 'lucide-react'
import { store } from '../lib/storage'
import type { Order } from '../types'
import { SampleInvoice } from '../components/SampleInvoice'

export function InvoicePreview() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    setOrder(store.getOrder(id) ?? null)
  }, [id])

  if (!order) {
    return (
      <div className="max-w-4xl">
        <div className="bg-via-card border border-via-border rounded-xl p-8 text-center">
          <p className="text-via-text-light">Order not found.</p>
          <Link to="/" className="inline-block mt-3 text-sm text-via-navy font-medium hover:underline">
            ← New order
          </Link>
        </div>
      </div>
    )
  }

  function copyJson() {
    if (!order) return
    navigator.clipboard.writeText(JSON.stringify(order.invoice_payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function deleteOrder() {
    if (!order) return
    if (!confirm('Delete this draft order?')) return
    store.deleteOrder(order.id)
    window.location.href = '/orders'
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-5 no-print">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-via-text hover:text-via-navy">
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={deleteOrder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-via-danger border border-via-danger/30 rounded-lg hover:bg-via-danger/5"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-via-text border border-via-border rounded-lg hover:bg-via-card"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={copyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-via-navy text-white rounded-lg hover:bg-via-navy-light"
          >
            <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy as JSON'}
          </button>
        </div>
      </div>

      <SampleInvoice invoice={order.invoice_payload} />

      <details className="mt-6 no-print">
        <summary className="cursor-pointer text-sm text-via-text-light hover:text-via-text">
          Show raw JSON payload (what the ERP would consume)
        </summary>
        <pre className="mt-3 text-xs bg-via-navy text-slate-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(order.invoice_payload, null, 2)}
        </pre>
      </details>
    </div>
  )
}
