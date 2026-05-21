# WYF Invoicer — Proof of Concept

A standalone React app demonstrating a simpler way to create Wayfair load orders.
**Goal:** show internal ERP devs the UX they should build natively inside ViaOps.

This app has no backend. All data (buyers, FOBs, sales reps, load types, draft orders)
lives in `localStorage` in the browser. There is no auth. Anyone with the URL can use it.

## What it does

1. JR (logistics) opens **New Order**, pastes the Wayfair "live load" email body, and the
   app auto-fills Load ID / Load Type / Trailer / Seal / PO.
2. JR picks the Buyer, FOB, and (optionally) the Sales Rep — Sales Rep defaults to the
   buyer's preferred rep if left blank.
3. Clicking **Generate Sample Invoice** stores a draft order and shows a read-only
   invoice view that mirrors the ViaOps "Generate Order" output: Account Manager,
   Order Type (Program), buyer name/company/address, PT Buyer ID, Carrier, Trailer,
   Seal, PO, Direct Shipping flag, Payment Type, and the parent SKU pattern
   (`WYF{FOB}{LoadType}{LoadID}`, e.g. `WYFAMDLQ50483`) at $0.
4. The preview has **Print** and **Copy as JSON** — the JSON is the payload an
   internal dev would consume when wiring this into the ERP.

## What is explicitly out of scope (Phase 2+)

- Pricing math (the WYF Price matrix isn't applied — parent SKU stays at $0)
- Real SKU creation (the SKU pattern is informational, marked "Pending")
- Any ViaOps integration / API call
- Replacing the Wayfair tracking spreadsheet
- User auth and roles

## Running locally

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # type check + production bundle
```

## Editing seed data

Out of the box the app ships with seed buyers, FOBs, load types, and sales reps that
match what's in `Wayfair Index and Tracking - Luis (3).xlsx` (the WYF Price and
Shipping Cost sheets). Open the **Admin** tab to edit them in-browser. Click
**Reset to seed data** to wipe local overrides and restart from `src/data/seedData.ts`.

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · react-router-dom 7 · lucide-react.
No Supabase, no API, no auth.
