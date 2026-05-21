import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import type {
  Customer,
  Destination,
  Fob,
  LoadType,
  Order,
  Program,
  SalesRep,
} from '../types'
import { store, newId } from '../lib/storage'
import { generateInvoice } from '../lib/generateInvoice'
import { OrderForm, type OrderFormValues } from '../components/OrderForm'

export function NewOrder() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<Program[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [fobs, setFobs] = useState<Fob[]>([])
  const [loadTypes, setLoadTypes] = useState<LoadType[]>([])
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])

  useEffect(() => {
    setPrograms(store.getPrograms())
    setCustomers(store.getCustomers())
    setDestinations(store.getDestinations())
    setFobs(store.getFobs())
    setLoadTypes(store.getLoadTypes())
    setSalesReps(store.getSalesReps())
  }, [])

  function handleSubmit(values: OrderFormValues) {
    const program = programs.find((p) => p.id === values.programId)
    const customer = customers.find((c) => c.id === values.customerId)
    const fob = fobs.find((f) => f.id === values.fobId)
    if (!program || !customer || !fob) return

    const loadType =
      program.has_load_types && values.loadTypeId
        ? loadTypes.find((l) => l.id === values.loadTypeId) ?? null
        : null
    const destination = values.destinationId
      ? destinations.find((d) => d.id === values.destinationId) ?? null
      : null
    const salesRep =
      salesReps.find((r) => r.id === values.salesRepId) ??
      salesReps.find((r) => r.id === customer.default_sales_rep_id) ??
      null

    const shippingRaw = values.shippingCost.trim()
    const shippingNum = shippingRaw === '' ? null : Number(shippingRaw.replace(/[,$\s]/g, ''))
    const shippingCost = shippingNum != null && Number.isFinite(shippingNum) ? shippingNum : null

    const invoice = generateInvoice({
      program,
      loadId: values.loadId.trim() || null,
      loadType,
      fob,
      shippingCost,
      customer,
      destination,
      salesRep,
    })

    const order: Order = {
      id: newId('ord'),
      created_at: new Date().toISOString(),
      program_id: program.id,
      load_id: invoice.load_id,
      load_type_id: loadType?.id ?? null,
      fob_id: fob.id,
      customer_id: customer.id,
      destination_id: destination?.id ?? null,
      sales_rep_id: salesRep?.id ?? null,
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
              Pick the program first, then fill the load and invoice details.
            </p>
          </div>
        </div>
      </header>

      <OrderForm
        programs={programs}
        customers={customers}
        destinations={destinations}
        fobs={fobs}
        loadTypes={loadTypes}
        salesReps={salesReps}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
