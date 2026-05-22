import type { BolData, FreightTerms, InvoicePayload, Shipper } from '../types'

export interface BolFormFields {
  carrierName: string
  trailerNumber: string
  sealNumber: string
  scac: string
  freightTerms: FreightTerms
  specialInstructions: string
  palletCount: string // raw string from form
  packageCount: string
  totalWeight: string
  commodityDescription: string
}

export const EMPTY_BOL_FORM: BolFormFields = {
  carrierName: '',
  trailerNumber: '',
  sealNumber: '',
  scac: '',
  freightTerms: 'Prepaid',
  specialInstructions: '',
  palletCount: '',
  packageCount: '',
  totalWeight: '',
  commodityDescription: '',
}

function parseNum(s: string): number | null {
  const trimmed = s.trim()
  if (!trimmed) return null
  const n = Number(trimmed.replace(/[,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}

function generateBolNumber(): string {
  // 8-digit number prefixed with "BOL-" for plausibility
  return `BOL-${String(Math.floor(Math.random() * 90_000_000) + 10_000_000)}`
}

interface GenerateBolInput {
  invoice: InvoicePayload
  shipper: Shipper | null
  form: BolFormFields
}

/**
 * Pure: assemble a BolData payload from the already-generated invoice,
 * the selected shipper, and the BOL form inputs. Ship-To fields are
 * mirrored from the invoice (customer + destination).
 */
export function generateBol({ invoice, shipper, form }: GenerateBolInput): BolData {
  const shipToName =
    [invoice.first_name, invoice.last_name].filter(Boolean).join(' ') ||
    invoice.customer_display_name

  return {
    bol_number: generateBolNumber(),
    date: new Date().toISOString(),
    shipper_name: shipper?.name ?? null,
    shipper_address1: shipper?.address1 ?? null,
    shipper_address2: shipper?.address2 ?? null,
    shipper_city: shipper?.city ?? null,
    shipper_state: shipper?.state ?? null,
    shipper_zip: shipper?.zip ?? null,
    shipper_phone: shipper?.phone ?? null,
    ship_to_name: shipToName,
    ship_to_company: invoice.company,
    ship_to_address1: invoice.address1,
    ship_to_address2: invoice.address2,
    ship_to_city: invoice.city,
    ship_to_state: invoice.state,
    ship_to_zip: invoice.zip,
    carrier_name: form.carrierName.trim() || invoice.carrier,
    trailer_number: form.trailerNumber.trim() || null,
    seal_number: form.sealNumber.trim() || null,
    scac: form.scac.trim() || null,
    freight_terms: form.freightTerms,
    special_instructions: form.specialInstructions.trim() || null,
    pallet_count: parseNum(form.palletCount),
    package_count: parseNum(form.packageCount),
    total_weight: parseNum(form.totalWeight),
    commodity_description: form.commodityDescription.trim() || null,
    customer_order_no: invoice.order_number,
  }
}
