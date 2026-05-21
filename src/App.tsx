import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { NewOrder } from './pages/NewOrder'
import { InvoicePreview } from './pages/InvoicePreview'
import { OrdersList } from './pages/OrdersList'
import { Admin } from './pages/Admin'
import { EmailImport } from './pages/EmailImport'

// Vite injects the base URL — `/` in dev, `/wyfinvoicer/` on GitHub Pages.
// Trim the trailing slash so react-router treats it as a basename.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<NewOrder />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:id" element={<InvoicePreview />} />
          <Route path="beta/email-import" element={<EmailImport />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/:tab" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
