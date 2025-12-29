import { useState } from 'react'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      {/* Main Content Area - Offset by sidebar width on desktop */}
      <main className="flex-1 lg:ml-64 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido a CARSOFT</h1>
              <p className="text-gray-400 mt-2">Sistema Integral de Gestión</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="px-4 py-2 bg-gray-900 rounded-lg text-sm text-gray-300 border border-gray-800">
                Usuario: <span className="text-white font-medium">Admin</span>
              </div>
            </div>
          </header>

          {/* Temporary Content Placeholder - This matches the 'Dashboard' feel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Ventas del Día', value: '$ 154,200', color: 'text-green-400' },
              { label: 'Pedidos Pendientes', value: '12', color: 'text-blue-400' },
              { label: 'Stock Bajo', value: '5 Prod.', color: 'text-red-400' },
              { label: 'Caja Actual', value: '$ 45,500', color: 'text-yellow-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:bg-gray-900 transition-colors">
                <h3 className="text-gray-500 text-sm font-medium mb-2">{stat.label}</h3>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
            <p>Selecciona una opción del menú para comenzar.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
