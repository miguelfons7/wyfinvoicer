export interface Program {
  id: string
  name: string // e.g. "Load-WYF"
  code: string // e.g. "WYF"
  has_load_types: boolean
  active: boolean
}

export interface Customer {
  id: string
  display_name: string // e.g. "Mayan Zeitlan"
  first_name: string | null
  last_name: string | null
  company: string | null
  pt_buyer_id: string | null
  default_order_type: string | null
  default_payment_type: string | null
  default_carrier: string | null
  default_sales_rep_id: string | null
  is_direct_shipping: boolean
  active: boolean
}

export interface Destination {
  id: string
  customer_id: string
  label: string // e.g. "Phx AZ"
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
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
  // Program + load
  program_name: string // "Load-WYF"
  program_code: string // "WYF"
  parent_sku_label: string // = program_name (placeholder line-item label)
  parent_sku_full: string | null // serialized SKU when load_id is set, e.g. "WYFAMDLQ50483"
  load_id: string | null // optional now
  load_type: string | null // null when program has no load types
  fob: string
  // Customer + Destination
  customer_display_name: string
  destination_label: string | null
  first_name: string | null
  last_name: string | null
  company: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  pt_buyer_id: string | null
  // Account / shipping
  account_manager: string | null
  order_type: string | null
  payment_type: string | null
  carrier: string | null
  direct_shipping: boolean
  parent_sku_cost: number
  shipping_cost: number | null
  generated_at: string
}

export interface Order {
  id: string
  created_at: string
  program_id: string
  load_id: string | null
  load_type_id: string | null
  fob_id: string
  customer_id: string
  destination_id: string | null
  sales_rep_id: string | null
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
