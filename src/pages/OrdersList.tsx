import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListOrdered, FileText } from 'lucide-react'
import { store } from '../lib/storage'
import type { Buyer, Fob, LoadType, Order } from '../types'

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [fobs, setFobs] = useState<Fob[]>([])
  const [loadTypes, setLoadTypes] = useState<LoadType[]>([])

  useEffect(() => {
    setOrders(store.getOrders())
    setBuyers(store.getBuyers())
    setFobs(store.getFobs())
    setLoadTypes(store.getLoadTypes())
  }, [])

  const buyerName = (id: string) => buyers.find((b) => b.id === id)?.display_name ?? '—'
  const fobName = (id: string) => fobs.find((f) => f.id === id)?.name ?? '—'
  const ltName = (id: string) => loadTypes.find((l) => l.id === id)?.name ?? '—'

  return (
    <div className="max-w-6xl">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-via-navy flex items-center justify-center">
          <ListOrdered className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-via-navy">Recent Orders</h1>
          <p className="text-sm text-via-text-light">All drafts saved on this device.</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="bg-via-card border border-via-border rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 text-via-text-light mx-auto mb-3" />
          <p className="text-sm text-via-text-light mb-4">No orders yet.</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-via-orange text-white text-sm font-medium rounded-lg hover:bg-via-orange-light"
          >
            Create your first order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-via-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-via-card text-xs uppercase tracking-wide text-via-text-light">
              <tr>
                <th className="text-left px-4 py-2.5">Date</th>
                <th className="text-left px-4 py-2.5">Parent SKU</th>
                <th className="text-left px-4 py-2.5">Buyer</th>
                <th className="text-left px-4 py-2.5">Load Type</th>
                <th className="text-left px-4 py-2.5">FOB</th>
                <th className="text-left px-4 py-2.5">PO #</th>
                <th className="text-right px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-via-border hover:bg-via-card/40">
                  <td className="px-4 py-2.5 text-via-text-light">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-via-text">{o.computed_sku_pattern}</td>
                  <td className="px-4 py-2.5 text-via-text">{buyerName(o.buyer_id)}</td>
                  <td className="px-4 py-2.5 text-via-text">{ltName(o.load_type_id)}</td>
                  <td className="px-4 py-2.5 text-via-text">{fobName(o.fob_id)}</td>
                  <td className="px-4 py-2.5 font-mono text-via-text-light">{o.po ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      to={`/orders/${o.id}`}
                      className="text-via-navy font-medium hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
