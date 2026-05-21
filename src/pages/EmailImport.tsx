import { useState } from 'react'
import { FlaskConical, Mail } from 'lucide-react'
import { parseLoadEmail } from '../lib/parseLoadEmail'
import type { ParsedLoadEmail } from '../types'

const SAMPLE_EMAIL = `This trailer is ready to be swapped out from Romeoville:

Load ID: 50427 (Salvage)
Trailer #: 247
Seal #: 64671074
Date Completed: 05/18/2026`

export function EmailImport() {
  const [emailText, setEmailText] = useState('')
  const [parsed, setParsed] = useState<ParsedLoadEmail | null>(null)
  const [didParse, setDidParse] = useState(false)

  function run() {
    setParsed(parseLoadEmail(emailText))
    setDidParse(true)
  }

  function loadSample() {
    setEmailText(SAMPLE_EMAIL)
    setParsed(null)
    setDidParse(false)
  }

  const fieldCount = parsed ? Object.values(parsed).filter(Boolean).length : 0

  return (
    <div className="max-w-3xl">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-via-navy">Email Import (Beta)</h1>
          <p className="text-sm text-via-text-light">
            Paste a Wayfair "live load" or "swap out" email — we'll extract the load fields.
          </p>
        </div>
      </header>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
        <strong>Beta:</strong> this only knows the WYF email format today. Other programs
        (WM, TGT, ZAP, COST, HD, AMZ) will be added as we see their email shapes. The
        parsed fields are <em>not</em> yet wired into the main New Order form — for now
        this is a sandbox to confirm the parser works on a new email.
      </div>

      <section className="bg-via-card rounded-xl border border-via-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-via-navy" />
          <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide">
            Paste email body
          </h2>
        </div>
        <textarea
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
          placeholder={SAMPLE_EMAIL}
          rows={9}
          className="w-full px-3 py-2 bg-white border border-via-border rounded-lg text-sm font-mono text-via-text focus:outline-none focus:ring-2 focus:ring-via-navy/30"
        />
        <div className="flex items-center justify-between mt-3 gap-3">
          <button
            type="button"
            onClick={loadSample}
            className="text-xs text-via-navy hover:underline"
          >
            Load sample email
          </button>
          <button
            type="button"
            onClick={run}
            disabled={!emailText.trim()}
            className="px-3 py-1.5 bg-via-navy text-white text-sm rounded-lg hover:bg-via-navy-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Parse
          </button>
        </div>
      </section>

      {didParse && (
        <section className="bg-white rounded-xl border border-via-border p-5 mt-6">
          <h2 className="text-sm font-semibold text-via-navy uppercase tracking-wide mb-3">
            Parsed fields — {fieldCount} found
          </h2>
          {fieldCount === 0 ? (
            <p className="text-sm text-via-text-light italic">
              No fields detected. Make sure the email contains labels like "Load ID:",
              "Trailer #:", "Seal #:", "PO:", or "Load Type:".
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <ParsedField label="Load ID" value={parsed?.loadId} />
              <ParsedField label="Load Type" value={parsed?.loadType} />
              <ParsedField label="Trailer" value={parsed?.trailer} />
              <ParsedField label="Seal" value={parsed?.seal} />
              <ParsedField label="PO" value={parsed?.po} />
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function ParsedField({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-via-text-light uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div
        className={`text-sm font-mono ${value ? 'text-via-navy font-semibold' : 'text-via-text-light italic'}`}
      >
        {value ?? '—'}
      </div>
    </div>
  )
}
