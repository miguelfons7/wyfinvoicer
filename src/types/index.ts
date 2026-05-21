export interface Buyer {
  id: string
  display_name: string
  first_name: string | null
  last_name: string | null
  company: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  pt_buyer_id: string | null
  default_order_type: string | null
  default_payment_type: string | null
  default_carrier: string | null
  default_sales_rep_id: string | null
  is_direct_shipping: boolean
  active: boolean
}

export interface SalesRep {
  id: string
  name: string
  active: boolean
}

export interface Fob {
  id: string
  name: string
  code: string
  active: boolean
}

export interface LoadType {
  id: string
  name: string
  code: string
  active: boolean
}

export interface InvoicePayload {
  order_number: string
  account_manager: string | null
  order_type: string | null
  first_name: string | null
  last_name: string | null
  company: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  pt_buyer_id: string | null
  carrier: string | null
  trailer: string | null
  seal: string | null
  po: string | null
  direct_shipping: boolean
  payment_type: string | null
  parent_sku_pattern: string
  parent_sku_cost: number
  shipping_cost: number | null
  load_id: string
  load_type: string
  fob: string
  buyer_display_name: string
  generated_at: string
}

export interface Order {
  id: string
  created_at: string
  load_id: string
  load_type_id: string
  trailer: string | null
  seal: string | null
  po: string | null
  buyer_id: string
  fob_id: string
  sales_rep_id: string | null
  computed_sku_pattern: string
  status: 'draft' | 'submitted' | 'cancelled'
  invoice_payload: InvoicePayload
}

export interface ParsedLoadEmail {
  loadId?: string
  loadType?: string
  trailer?: string
  seal?: string
  po?: string
}
