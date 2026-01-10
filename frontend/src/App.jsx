import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopNavbar from './components/TopNavbar'
import Ventas from './pages/Ventas'
import Proveedores from './pages/Proveedores'
import NuevaVenta from './pages/NuevaVenta'
import Clientes from './pages/Clientes'
import Productos from './pages/Productos'
import Pedidos from './pages/Pedidos'
import NuevoPedido from './pages/NuevoPedido'
import Compras from './pages/Compras'
import NuevaCompra from './pages/NuevaCompra'
import Caja from './pages/Caja'
import ActualizarPrecios from './pages/ActualizarPrecios'
import PlanCuentas from './pages/PlanCuentas'
import Ejercicios from './pages/Ejercicios'
import Asientos from './pages/Asientos'
import LibroMayor from './pages/LibroMayor'
import Balance from './pages/Balance'

// Componente Dashboard temporal con estilos Bootstrap
const Dashboard = () => (
  <div className="container-fluid p-4">
    <header className="mb-4 d-flex align-items-center justify-content-between">
      <div>
        <h1 className="h3 fw-bold text-dark tracking-tight">Bienvenido a CARSOFT</h1>
        <p className="text-secondary mt-1">Sistema Integral de Gestión</p>
      </div>
    </header>

    <div className="row g-4 mb-4">
      {[
        { label: 'Ventas del Día', value: '$ 154,200', color: 'text-success', border: 'border-success' },
        { label: 'Pedidos Pendientes', value: '12', color: 'text-primary', border: 'border-primary' },
        { label: 'Stock Bajo', value: '5 Prod.', color: 'text-danger', border: 'border-danger' },
        { label: 'Caja Actual', value: '$ 45,500', color: 'text-warning', border: 'border-warning' },
      ].map((stat, i) => (
        <div key={i} className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className={`card-body border-start border-4 ${stat.border}`}>
              <h6 className="card-subtitle mb-2 text-muted small text-uppercase">{stat.label}</h6>
              <h2 className={`card-title mb-0 fw-bold ${stat.color}`}>{stat.value}</h2>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="card border-0 shadow-sm p-5 text-center text-muted">
      <p className="mb-0">Selecciona una opción del menú para comenzar.</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="d-flex min-vh-100 bg-light">
        <Sidebar />

        {/* Main Content Area - Offset by sidebar width on desktop */}
        <main className="flex-grow-1 transition-all d-flex flex-column" style={{ marginLeft: '0px' }}>
          <TopNavbar />
          <style>
            {`
              @media (min-width: 992px) {
                main { margin-left: 260px !important; }
              }
            `}
          </style>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes/" element={<Clientes />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/nuevo" element={<Navigate to="/productos" replace />} />
            <Route path="/precios/actualizar" element={<ActualizarPrecios />} />
            <Route path="/contabilidad/plan-cuentas" element={<PlanCuentas />} />
            <Route path="/contabilidad/ejercicios" element={<Ejercicios />} />
            <Route path="/contabilidad/asientos" element={<Asientos />} />
            <Route path="/contabilidad/mayor" element={<LibroMayor />} />
            <Route path="/contabilidad/balance" element={<Balance />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/ventas/nuevo" element={<NuevaVenta />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/nuevo" element={<NuevoPedido />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/compras/nueva" element={<NuevaCompra />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/caja" element={<Caja />} />
            <Route path="/caja/" element={<Caja />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
