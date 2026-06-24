import Sidebar from './Sidebar'

export default function DashboardLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-outline-variant flex items-center px-lg sticky top-0 z-30">
          <h1 className="text-title-lg font-bold text-on-surface">{title}</h1>
        </header>
        <main className="flex-1 p-lg bg-surface-container-low">
          {children}
        </main>
      </div>
    </div>
  )
}