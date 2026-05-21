import { NavLink, Outlet } from 'react-router-dom'
import { FilePlus2, ListOrdered, Settings, Truck } from 'lucide-react'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-via-sidebar-hover text-white'
      : 'text-slate-300 hover:bg-via-sidebar-hover hover:text-white'
  }`

export function AppShell() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-via-sidebar text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-via-sidebar-hover flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-via-orange flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold leading-tight">WYF Invoicer</div>
            <div className="text-xs text-slate-400">Proof of Concept</div>
          </div>
        </div>
        <nav className="p-3 flex flex-col gap-1 flex-1">
          <NavLink to="/" end className={navLinkClass}>
            <FilePlus2 className="w-4 h-4" /> New Order
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            <ListOrdered className="w-4 h-4" /> Recent Orders
          </NavLink>
          <NavLink to="/admin" className={navLinkClass}>
            <Settings className="w-4 h-4" /> Admin
          </NavLink>
        </nav>
        <div className="p-4 text-xs text-slate-400 border-t border-via-sidebar-hover">
          Spec demo for ERP devs — data lives only in this browser.
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
