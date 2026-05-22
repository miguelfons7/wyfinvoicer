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

export interface Shipper {
  id: string
  name: string // e.g. "Wayfair Aberdeen DC"
  contact: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  phone: string | null
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

export type FreightTerms = 'Prepaid' | 'Collect' | '3rd Party'

export interface BolData {
  bol_number: string
  date: string // ISO
  // Ship From (Shipper)
  shipper_name: string | null
  shipper_address1: string | null
  shipper_address2: string | null
  shipper_city: string | null
  shipper_state: string | null
  shipper_zip: string | null
  shipper_phone: string | null
  // Ship To (Customer + Destination) — mirrored from the invoice payload
  ship_to_name: string
  ship_to_company: string | null
  ship_to_address1: string | null
  ship_to_address2: string | null
  ship_to_city: string | null
  ship_to_state: string | null
  ship_to_zip: string | null
  // Carrier
  carrier_name: string | null
  trailer_number: string | null
  seal_number: string | null
  scac: string | null
  // Freight + commodity
  freight_terms: FreightTerms
  special_instructions: string | null
  pallet_count: number | null
  package_count: number | null
  total_weight: number | null
  commodity_description: string | null
  customer_order_no: string // generally the invoice/order number
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
  shipper_id: string | null
  notify_customer: boolean
  notify_am: boolean
  status: 'draft' | 'submitted' | 'cancelled'
  invoice_payload: InvoicePayload
  bol_data: BolData | null
}

export interface ParsedLoadEmail {
  loadId?: string
  loadType?: string
  trailer?: string
  seal?: string
  po?: string
}
