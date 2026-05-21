import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import type { Buyer, Fob, LoadType, Order, SalesRep } from '../types'
import { store, newId } from '../lib/storage'
import { generateInvoice } from '../lib/generateInvoice'
import { OrderForm, type OrderFormValues } from '../components/OrderForm'

export function NewOrder() {
  const navigate = useNavigate()
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [fobs, setFobs] = useState<Fob[]>([])
  const [loadTypes, setLoadTypes] = useState<LoadType[]>([])
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])

  useEffect(() => {
    setBuyers(store.getBuyers())
    setFobs(store.getFobs())
    setLoadTypes(store.getLoadTypes())
    setSalesReps(store.getSalesReps())
  }, [])

  function handleSubmit(values: OrderFormValues) {
    const buyer = buyers.find((b) => b.id === values.buyerId)
    const fob = fobs.find((f) => f.id === values.fobId)
    const loadType = loadTypes.find((l) => l.id === values.loadTypeId)
    if (!buyer || !fob || !loadType) return
    const salesRep =
      salesReps.find((r) => r.id === values.salesRepId) ??
      salesReps.find((r) => r.id === buyer.default_sales_rep_id) ??
      null

    const shippingRaw = values.shippingCost.trim()
    const shippingNum = shippingRaw === '' ? null : Number(shippingRaw.replace(/[,$\s]/g, ''))
    const shippingCost = shippingNum != null && Number.isFinite(shippingNum) ? shippingNum : null

    const invoice = generateInvoice({
      loadId: values.loadId.trim(),
      loadType,
      trailer: values.trailer.trim() || null,
      seal: values.seal.trim() || null,
      po: values.po.trim() || null,
      buyer,
      fob,
      salesRep,
      shippingCost,
    })

    const order: Order = {
      id: newId('ord'),
      created_at: new Date().toISOString(),
      load_id: invoice.load_id,
      load_type_id: loadType.id,
      trailer: invoice.trailer,
      seal: invoice.seal,
      po: invoice.po,
      buyer_id: buyer.id,
      fob_id: fob.id,
      sales_rep_id: salesRep?.id ?? null,
      computed_sku_pattern: invoice.parent_sku_pattern,
      status: 'draft',
      invoice_payload: invoice,
    }
    store.saveOrder(order)
    navigate(`/orders/${order.id}`)
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-via-navy flex items-center justify-center">
            <FilePlus2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-via-navy">New Order</h1>
            <p className="text-sm text-via-text-light">
              Enter the load info — we'll generate a sample invoice mirroring the ViaOps order page.
            </p>
          </div>
        </div>
      </header>

      <OrderForm
        buyers={buyers}
        fobs={fobs}
        loadTypes={loadTypes}
        salesReps={salesReps}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
