import type { BolData } from '../types'

interface Props {
  bol: BolData
}

function fmtNum(n: number | null): string {
  return n != null && Number.isFinite(n) ? n.toLocaleString('en-US') : '—'
}

function fmtAddress(
  parts: { address1: string | null; address2: string | null; city: string | null; state: string | null; zip: string | null },
) {
  const lines: string[] = []
  if (parts.address1) lines.push(parts.address1)
  if (parts.address2) lines.push(parts.address2)
  const cityLine = [parts.city, parts.state].filter(Boolean).join(', ')
  const cityZip = [cityLine, parts.zip].filter(Boolean).join(' ')
  if (cityZip) lines.push(cityZip)
  return lines
}

export function SampleBol({ bol }: Props) {
  const shipFromLines = fmtAddress({
    address1: bol.shipper_address1,
    address2: bol.shipper_address2,
    city: bol.shipper_city,
    state: bol.shipper_state,
    zip: bol.shipper_zip,
  })
  const shipToLines = fmtAddress({
    address1: bol.ship_to_address1,
    address2: bol.ship_to_address2,
    city: bol.ship_to_city,
    state: bol.ship_to_state,
    zip: bol.ship_to_zip,
  })

  return (
    <div className="bg-white border border-slate-400 print-card font-sans text-[13px] text-slate-900">
      {/* Title row */}
      <div className="grid grid-cols-12 border-b border-slate-400">
        <div className="col-span-3 px-3 py-2 border-r border-slate-400">
          <span className="text-red-600 font-bold">Date</span>
          <span className="ml-2">{new Date(bol.date).toLocaleDateString()}</span>
        </div>
        <div className="col-span-7 px-3 py-2 border-r border-slate-400 text-center font-bold">
          Bill of Lading – Short Form – Not Negotiable
        </div>
        <div className="col-span-2 px-3 py-2 text-center text-xs">Page 1 of 1</div>
      </div>

      {/* Ship From / BOL Number */}
      <div className="grid grid-cols-12 border-b border-slate-400">
        <div className="col-span-7 border-r border-slate-400">
          <div className="bg-slate-100 px-3 py-1 font-bold border-b border-slate-400">
            Ship From
          </div>
          <div className="px-3 py-2 min-h-[72px]">
            {bol.shipper_name && <div className="font-semibold">{bol.shipper_name}</div>}
            {shipFromLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
            {bol.shipper_phone && <div className="text-xs text-slate-600 mt-1">{bol.shipper_phone}</div>}
            {!bol.shipper_name && shipFromLines.length === 0 && (
              <div className="text-slate-400 italic text-xs">No shipper selected</div>
            )}
          </div>
        </div>
        <div className="col-span-5">
          <div className="px-3 py-1 font-bold border-b border-slate-400">Bill of Lading Number:</div>
          <div className="bg-yellow-300 px-3 py-3 min-h-[64px] font-mono text-base">{bol.bol_number}</div>
        </div>
      </div>

      {/* Ship To / Carrier info */}
      <div className="grid grid-cols-12 border-b border-slate-400">
        <div className="col-span-7 border-r border-slate-400">
          <div className="bg-slate-100 px-3 py-1 font-bold border-b border-slate-400">
            Ship To
          </div>
          <div className="px-3 py-2 min-h-[88px]">
            <div className="font-semibold">{bol.ship_to_name}</div>
            {bol.ship_to_company && <div>{bol.ship_to_company}</div>}
            {shipToLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
        <div className="col-span-5 text-sm">
          <KvRow label="Carrier Name:" value={bol.carrier_name} />
          <KvRow label="Trailer number:" value={bol.trailer_number} mono />
          <KvRow label="Seal number:" value={bol.seal_number} mono last />
        </div>
      </div>

      {/* Third party / SCAC */}
      <div className="grid grid-cols-12 border-b border-slate-400">
        <div className="col-span-7 border-r border-slate-400">
          <div className="bg-slate-100 px-3 py-1 font-bold border-b border-slate-400">
            Third Party Freight Charges Bill to
          </div>
          <div className="px-3 py-2 min-h-[60px] text-slate-400 italic text-xs">
            {bol.freight_terms === '3rd Party' ? 'Bill third party (not specified)' : '—'}
          </div>
        </div>
        <div className="col-span-5">
          <div className="px-3 py-1 font-bold border-b border-slate-400">SCAC:</div>
          <div className="bg-sky-100 px-3 py-3 min-h-[44px] font-mono">{bol.scac ?? '—'}</div>
        </div>
      </div>

      {/* Special instructions / Freight terms */}
      <div className="grid grid-cols-12 border-b border-slate-400">
        <div className="col-span-7 border-r border-slate-400 px-3 py-2">
          <div className="font-semibold mb-1">Special Instructions:</div>
          <div className="text-sm min-h-[40px] whitespace-pre-wrap">
            {bol.special_instructions ?? <span className="text-slate-400 italic text-xs">None</span>}
          </div>
        </div>
        <div className="col-span-5 px-3 py-2">
          <div className="font-semibold text-sm mb-1">
            Freight Charge Terms (prepaid unless marked otherwise):
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Choice label="Prepaid" checked={bol.freight_terms === 'Prepaid'} />
            <Choice label="Collect" checked={bol.freight_terms === 'Collect'} />
            <Choice label="3rd Party" checked={bol.freight_terms === '3rd Party'} />
          </div>
        </div>
      </div>

      {/* Customer Order Information */}
      <div>
        <div className="bg-slate-100 border-b border-slate-400 text-center font-bold py-1.5">
          Customer Order Information
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs">
            <tr className="border-b border-slate-400">
              <th className="border-r border-slate-400 text-left px-3 py-1.5 font-semibold">Customer Order No.</th>
              <th className="border-r border-slate-400 px-3 py-1.5 font-semibold">
                # of<br />Packages
              </th>
              <th className="border-r border-slate-400 px-3 py-1.5 font-semibold">Weight</th>
              <th className="border-r border-slate-400 px-3 py-1.5 font-semibold">Pallet/Slip<br />(circle one)</th>
              <th className="text-left px-3 py-1.5 font-semibold">Additional Shipper Information</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-400">
              <td className="border-r border-slate-400 px-3 py-2 font-mono">#{bol.customer_order_no}</td>
              <td className="border-r border-slate-400 px-3 py-2 text-center">{fmtNum(bol.package_count)}</td>
              <td className="border-r border-slate-400 px-3 py-2 text-center">{fmtNum(bol.total_weight)}</td>
              <td className="border-r border-slate-400 px-3 py-2 text-center">
                <span className={bol.pallet_count != null && bol.pallet_count > 0 ? 'font-bold' : 'text-slate-400'}>Y</span>
                <span className="mx-2 text-slate-300">/</span>
                <span className={bol.pallet_count == null || bol.pallet_count === 0 ? 'font-bold' : 'text-slate-400'}>N</span>
              </td>
              <td className="px-3 py-2 text-xs text-slate-600">
                {bol.pallet_count != null ? `${bol.pallet_count} pallets` : '—'}
              </td>
            </tr>
            <tr className="border-b border-slate-400 bg-slate-50">
              <td className="border-r border-slate-400 px-3 py-1.5 font-semibold">Grand Total</td>
              <td className="border-r border-slate-400 px-3 py-1.5 text-center">{fmtNum(bol.package_count)}</td>
              <td className="border-r border-slate-400 px-3 py-1.5 text-center">{fmtNum(bol.total_weight)}</td>
              <td className="border-r border-slate-400"></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Carrier information */}
      <div>
        <div className="bg-slate-100 border-b border-slate-400 text-center font-bold py-1.5">
          Carrier Information
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs">
            <tr className="border-b border-slate-400">
              <th colSpan={3} className="border-r border-slate-400 px-3 py-1.5 font-semibold">
                Handling Unit
              </th>
              <th className="border-r border-slate-400 px-3 py-1.5 font-semibold text-left">
                Commodity Description
              </th>
              <th colSpan={2} className="px-3 py-1.5 font-semibold">LTL Only</th>
            </tr>
            <tr className="border-b border-slate-400">
              <th className="border-r border-slate-400 px-2 py-1 font-semibold">QTY</th>
              <th className="border-r border-slate-400 px-2 py-1 font-semibold">TYPE</th>
              <th className="border-r border-slate-400 px-2 py-1 font-semibold">Weight</th>
              <th className="border-r border-slate-400 px-2 py-1 text-[10px] text-slate-600 italic">
                Commodities requiring special or additional care or attention in handling or stowing must be so marked and packaged as to ensure safe transportation with ordinary care. See Section 2(e) of NMFC item 360.
              </th>
              <th className="border-r border-slate-400 px-2 py-1 font-semibold">NMFC No.</th>
              <th className="px-2 py-1 font-semibold">Class</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-400">
              <td className="border-r border-slate-400 px-2 py-2 text-center">{fmtNum(bol.pallet_count)}</td>
              <td className="border-r border-slate-400 px-2 py-2 text-center">Pallet</td>
              <td className="border-r border-slate-400 px-2 py-2 text-center">{fmtNum(bol.total_weight)}</td>
              <td className="border-r border-slate-400 px-3 py-2">
                {bol.commodity_description ?? <span className="text-slate-400 italic text-xs">—</span>}
              </td>
              <td className="border-r border-slate-400 px-2 py-2 text-center text-slate-400">—</td>
              <td className="px-2 py-2 text-center text-slate-400">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-400 bg-slate-50 px-3 py-2 text-[10px] text-slate-600 italic">
        Sample BOL — visual spec for ERP devs. Real BOLs are issued by the carrier and signed at pickup.
      </div>
    </div>
  )
}

function KvRow({
  label,
  value,
  mono,
  last,
}: {
  label: string
  value: string | null
  mono?: boolean
  last?: boolean
}) {
  return (
    <div className={`grid grid-cols-2 ${last ? '' : 'border-b border-slate-400'}`}>
      <div className="border-r border-slate-400 px-3 py-1.5 font-semibold">{label}</div>
      <div className={`px-3 py-1.5 ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-slate-400 italic text-xs">—</span>}
      </div>
    </div>
  )
}

function Choice({ label, checked }: { label: string; checked: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center w-5 h-5 border ${
          checked ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-400 text-transparent'
        }`}
      >
        X
      </span>
      <span className={checked ? 'font-bold' : ''}>{label}</span>
    </span>
  )
}
