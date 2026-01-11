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
import Remitos from './pages/Remitos'
import NotasCredito from './pages/NotasCredito'
import DetalleRemito from './pages/DetalleRemito'
import DetalleNotaCredito from './pages/DetalleNotaCredito'
import NotasDebito from './pages/NotasDebito'
import DetalleNotaDebito from './pages/DetalleNotaDebito'

import Parametros from './pages/Parametros'
import ConfiguracionEmpresa from './pages/ConfiguracionEmpresa'

import Dashboard from './pages/Dashboard'

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
                main { margin-left: 300px !important; }
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
            <Route path="/precios/actualizar" element={<ActualizarPrecios />} />
            <Route path="/parametros" element={<Parametros />} />
            <Route path="/configuracion/empresa" element={<ConfiguracionEmpresa />} />
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


            <Route path="/remitos" element={<Remitos />} />
            <Route path="/comprobantes/remito/:id" element={<DetalleRemito />} />
            <Route path="/comprobantes/nc/:id" element={<DetalleNotaCredito />} />
            <Route path="/notas-credito" element={<NotasCredito />} />
            <Route path="/notas-debito" element={<NotasDebito />} />
            <Route path="/comprobantes/nd/:id" element={<DetalleNotaDebito />} />
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
