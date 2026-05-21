import type { ParsedLoadEmail } from '../types'

/**
 * Extract load metadata from a pasted Wayfair "live load" email.
 *
 * Two common formats we see (separators are messy — Wayfair uses any mix of
 * `:` `#` `Number` and whitespace between the label and the value):
 *
 *   Format A (Aberdeen live-load):
 *     Load ID: 50483
 *     Load Type: LQ
 *     Trailer Number: 10752
 *     Seal: 59058051
 *     PO: 554124763LIQ
 *
 *   Format B (Romeoville swap-out):
 *     Load ID: 50427 (Salvage)
 *     Trailer #: 247
 *     Seal #: 64671074
 *
 * The regexes below tolerate `#`, `:`, and any whitespace in any order between
 * the label and the value. Load type can also be in parens after Load ID.
 */

// Common "separator" between a label like "Load ID" and its value.
// Matches any combination of `#`, `:`, and whitespace, one or more times.
const SEP = String.raw`[\s#:]+`

// Helper to build a regex for "LABEL ... VALUE"
function labelRegex(label: string, valueClass = '[A-Za-z0-9-]+'): RegExp {
  return new RegExp(`${label}${SEP}(${valueClass})`, 'i')
}

// Strict patterns (anchored to the label)
const LOAD_ID = labelRegex('Load\\s*ID')
const LOAD_TYPE_EXPLICIT = labelRegex('Load\\s*Type')
// Parenthesized load type immediately after the load id, e.g. "Load ID: 50427 (Salvage)"
const LOAD_TYPE_PARENS = /Load\s*ID[\s#:]+[A-Za-z0-9-]+\s*\(([^)]+)\)/i
const TRAILER = labelRegex('Trailer(?:\\s*Number)?')
const SEAL = labelRegex('Seal')
const PO = labelRegex('PO')

export function parseLoadEmail(text: string): ParsedLoadEmail {
  const out: ParsedLoadEmail = {}

  const loadId = text.match(LOAD_ID)
  if (loadId) out.loadId = loadId[1].trim()

  // Try explicit "Load Type:" first, then parenthesized fallback
  const ltExplicit = text.match(LOAD_TYPE_EXPLICIT)
  if (ltExplicit) {
    out.loadType = ltExplicit[1].trim()
  } else {
    const ltParens = text.match(LOAD_TYPE_PARENS)
    if (ltParens) out.loadType = ltParens[1].trim()
  }

  const trailer = text.match(TRAILER)
  if (trailer) out.trailer = trailer[1].trim()

  const seal = text.match(SEAL)
  if (seal) out.seal = seal[1].trim()

  const po = text.match(PO)
  if (po) out.po = po[1].trim()

  return out
}
