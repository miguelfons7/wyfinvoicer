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
 * and computes the parent SKU pattern: WYF{fob.code}{loadType.code}{trailer || loadId}.
 *
 * Examples (from Miguel's WYF tracking sheet):
 *   WYFRILLQ50457 = WYF · Romeoville IL · LQ · trailer 50457
 *   WYFAMDS49767  = WYF · Aberdeen MD · Salvage · trailer 49767
 * The suffix is the trailer number when present, otherwise the load ID.
 */
export function generateInvoice(input: GenerateInvoiceInput): InvoicePayload {
  const { loadId, loadType, trailer, seal, po, buyer, fob, salesRep, shippingCost } = input

  const skuSuffix = (trailer && trailer.trim() !== '') ? trailer.trim() : loadId
  const parentSku = `WYF${fob.code}${loadType.code}${skuSuffix}`

  return {
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
