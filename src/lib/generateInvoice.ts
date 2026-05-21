import type { Buyer, Fob, InvoicePayload, LoadType, SalesRep } from '../types'

export interface GenerateInvoiceInput {
  loadId: string
  loadType: LoadType
  trailer: string | null
  seal: string | null
  po: string | null
  buyer: Buyer
  fob: Fob
  salesRep: SalesRep | null
  shippingCost: number | null
}

/**
 * Pure: turns a draft order's selections into the invoice payload that
 * mirrors the ViaOps Generate-Order output. Resolves buyer defaults
 * (Account Manager, Order Type, Payment Type, Carrier, Direct Shipping)
 * and computes the parent SKU pattern: WYF{fob.code}{loadType.code}{loadId}.
 *
 * Examples (from Miguel's WYF tracking sheet):
 *   WYFAMDLQ50483 = WYF · Aberdeen MD · LQ · Load ID 50483
 *   WYFRILS50427  = WYF · Romeoville IL · Salvage · Load ID 50427
 * The Load ID drives the SKU suffix.
 */
function generateOrderNumber(): string {
  // Mimic ViaOps order numbers seen in the WYF tracking sheet (e.g. 1386858, 1387235).
  // Range 1380000-1399999 keeps it visually plausible for the POC.
  return String(1_380_000 + Math.floor(Math.random() * 20_000))
}

export function generateInvoice(input: GenerateInvoiceInput): InvoicePayload {
  const { loadId, loadType, trailer, seal, po, buyer, fob, salesRep, shippingCost } = input

  const parentSku = `WYF${fob.code}${loadType.code}${loadId}`

  return {
    order_number: generateOrderNumber(),
    account_manager: salesRep?.name ?? null,
    order_type: buyer.default_order_type,
    first_name: buyer.first_name,
    last_name: buyer.last_name,
    company: buyer.company,
    address1: buyer.address1,
    address2: buyer.address2,
    city: buyer.city,
    state: buyer.state,
    zip: buyer.zip,
    pt_buyer_id: buyer.pt_buyer_id,
    carrier: buyer.default_carrier,
    trailer,
    seal,
    po,
    direct_shipping: buyer.is_direct_shipping,
    payment_type: buyer.default_payment_type,
    parent_sku_pattern: parentSku,
    parent_sku_cost: 0,
    shipping_cost: shippingCost,
    load_id: loadId,
    load_type: loadType.name,
    fob: fob.name,
    buyer_display_name: buyer.display_name,
    generated_at: new Date().toISOString(),
  }
}
