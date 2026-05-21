import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { NewOrder } from './pages/NewOrder'
import { InvoicePreview } from './pages/InvoicePreview'
import { OrdersList } from './pages/OrdersList'
import { Admin } from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<NewOrder />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:id" element={<InvoicePreview />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/:tab" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
