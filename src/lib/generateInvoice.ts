import type {
  Customer,
  Destination,
  Fob,
  InvoicePayload,
  LoadType,
  Program,
  SalesRep,
} from '../types'

export interface GenerateInvoiceInput {
  program: Program
  loadId: string | null
  loadType: LoadType | null
  fob: Fob
  shippingCost: number | null
  customer: Customer
  destination: Destination | null
  salesRep: SalesRep | null
}

/**
 * Pure: turns a draft order's selections into the invoice payload that
 * mirrors the ViaOps Generate-Order output. Resolves customer defaults
 * (Account Manager, Order Type, Payment Type, Carrier, Direct Shipping)
 * and uses the program name as the parent SKU placeholder (e.g. "Load-WYF").
 * The actual serialized SKU is generated later in the ERP.
 */
function generateOrderNumber(): string {
  // Mimic ViaOps order numbers seen in the WYF tracking sheet.
  return String(1_380_000 + Math.floor(Math.random() * 20_000))
}

export function generateInvoice(input: GenerateInvoiceInput): InvoicePayload {
  const { program, loadId, loadType, fob, shippingCost, customer, destination, salesRep } = input

  return {
    order_number: generateOrderNumber(),
    program_name: program.name,
    program_code: program.code,
    parent_sku_label: program.name,
    load_id: loadId,
    load_type: program.has_load_types ? loadType?.name ?? null : null,
    fob: fob.name,
    customer_display_name: customer.display_name,
    destination_label: destination?.label ?? null,
    first_name: customer.first_name,
    last_name: customer.last_name,
    company: customer.company,
    address1: destination?.address1 ?? null,
    address2: destination?.address2 ?? null,
    city: destination?.city ?? null,
    state: destination?.state ?? null,
    zip: destination?.zip ?? null,
    pt_buyer_id: customer.pt_buyer_id,
    account_manager: salesRep?.name ?? null,
    order_type: customer.default_order_type,
    payment_type: customer.default_payment_type,
    carrier: customer.default_carrier,
    direct_shipping: customer.is_direct_shipping,
    parent_sku_cost: 0,
    shipping_cost: shippingCost,
    generated_at: new Date().toISOString(),
  }
}
