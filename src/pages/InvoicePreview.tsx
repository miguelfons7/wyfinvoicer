import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Bell, Copy, FileSignature, FileText, Printer, Trash2, UserCog } from 'lucide-react'
import { store } from '../lib/storage'
import type { Order } from '../types'
import { SampleInvoice } from '../components/SampleInvoice'
import { SampleBol } from '../components/SampleBol'

type Tab = 'invoice' | 'bol'

export function InvoicePreview() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [tab, setTab] = useState<Tab>('invoice')
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
    const payload =
      tab === 'bol' && order.bol_data ? order.bol_data : order.invoice_payload
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function deleteOrder() {
    if (!order) return
    if (!confirm('Delete this draft order?')) return
    store.deleteOrder(order.id)
    window.location.href = '/orders'
  }

  const hasBol = order.bol_data != null
  const activeTab: Tab = tab === 'bol' && hasBol ? 'bol' : 'invoice'

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4 no-print">
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
            <Copy className="w-4 h-4" /> {copied ? 'Copied!' : `Copy ${activeTab === 'bol' ? 'BOL' : 'Invoice'} JSON`}
          </button>
        </div>
      </div>

      {/* Notification badges */}
      {(order.notify_customer || order.notify_am) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 no-print">
          {order.notify_customer && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">
              <Bell className="w-3.5 h-3.5" /> Customer notification queued
            </span>
          )}
          {order.notify_am && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
              <UserCog className="w-3.5 h-3.5" /> AM notification queued
            </span>
          )}
        </div>
      )}

      {/* Tabs (only when BOL exists) */}
      {hasBol && (
        <div className="flex items-center gap-1 border-b border-via-border mb-5 no-print">
          <button
            onClick={() => setTab('invoice')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
              activeTab === 'invoice'
                ? 'border-via-navy text-via-navy'
                : 'border-transparent text-via-text-light hover:text-via-text'
            }`}
          >
            <FileText className="w-4 h-4" /> Invoice
          </button>
          <button
            onClick={() => setTab('bol')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
              activeTab === 'bol'
                ? 'border-via-orange text-via-orange'
                : 'border-transparent text-via-text-light hover:text-via-text'
            }`}
          >
            <FileSignature className="w-4 h-4" /> Bill of Lading
          </button>
        </div>
      )}

      {activeTab === 'invoice' && <SampleInvoice invoice={order.invoice_payload} />}
      {activeTab === 'bol' && order.bol_data && <SampleBol bol={order.bol_data} />}

      <details className="mt-6 no-print">
        <summary className="cursor-pointer text-sm text-via-text-light hover:text-via-text">
          Show raw JSON ({activeTab === 'bol' ? 'BOL' : 'invoice'} payload — what the ERP would consume)
        </summary>
        <pre className="mt-3 text-xs bg-via-navy text-slate-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(activeTab === 'bol' ? order.bol_data : order.invoice_payload, null, 2)}
        </pre>
      </details>
    </div>
  )
}
