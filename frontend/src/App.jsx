import { useState, Suspense } from 'react'
import React from 'react'
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
import DetallePedido from './pages/DetallePedido'
import Compras from './pages/Compras'
import NuevaCompra from './pages/NuevaCompra'
import DetalleCompra from './pages/DetalleCompra'
import DetalleVenta from './pages/DetalleVenta'
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
import Presupuestos from './pages/Presupuestos'
import NuevoPresupuesto from './pages/NuevoPresupuesto'
import DetallePresupuesto from './pages/DetallePresupuesto'

import Parametros from './pages/Parametros'
import ConfiguracionEmpresa from './pages/ConfiguracionEmpresa'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Cheques from './pages/Cheques'
import ConciliacionBancaria from './pages/ConciliacionBancaria'
import Marcas from './pages/Marcas'
import Categorias from './pages/Categorias'
import Rubros from './pages/Rubros'
import Unidades from './pages/Unidades'
import Localidades from './pages/Localidades'
import ReportesContables from './pages/ReportesContables'
import { useAuth } from './context/AuthContext'

// Lazy load component to safely handle build errors
const CuentasCorrientesClientes = React.lazy(() => import('./pages/CuentasCorrientesClientes'));
const DetalleCuentaCorriente = React.lazy(() => import('./pages/DetalleCuentaCorriente'));
const CuentasCorrientesProveedores = React.lazy(() => import('./pages/CuentasCorrientesProveedores'));

const ProtectedRoute = ({ children, permission, isHome }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login/';
    return null;
  }

  if (permission && !hasPermission(permission)) {
    if (isHome) {
      return (
        <div className="container-fluid h-100 d-flex align-items-center justify-content-center bg-white">
          <div className="text-center fade-in">
            <div className="mb-4 opacity-25">
              <img src="/static/logo.png" alt="Logo" style={{ width: '120px', filter: 'grayscale(100%)' }}
                onError={(e) => e.target.style.display = 'none'} />
            </div>
            <h2 className="fw-bold text-dark mb-2">Bienvenido al Sistema</h2>
            <p className="text-muted">Seleccione una opción del menú lateral para comenzar a operar.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Acceso Restringido</h4>
          <p>No tienes permisos suficientes para acceder a esta sección. Por favor, contacta a un administrador.</p>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex vh-100 overflow-hidden bg-light">
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
          <div className="flex-grow-1 overflow-auto custom-scrollbar">
            <Routes>
              <Route path="/" element={<ProtectedRoute permission="reportes" isHome={true}><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute permission="reportes" isHome={true}><Dashboard /></ProtectedRoute>} />
              <Route path="/clientes/" element={<ProtectedRoute permission="clientes"><Clientes /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute permission="clientes"><Clientes /></ProtectedRoute>} />
              <Route path="/productos" element={<ProtectedRoute permission="productos"><Productos /></ProtectedRoute>} />
              <Route path="/productos/nuevo" element={<Navigate to="/productos" replace />} />
              <Route path="/precios/actualizar" element={<ProtectedRoute permission="productos"><ActualizarPrecios /></ProtectedRoute>} />
              <Route path="/precios/actualizar" element={<ProtectedRoute permission="productos"><ActualizarPrecios /></ProtectedRoute>} />
              <Route path="/parametros" element={<ProtectedRoute permission="configuracion"><Parametros /></ProtectedRoute>} />
              <Route path="/configuracion/empresa" element={<ProtectedRoute permission="configuracion"><ConfiguracionEmpresa /></ProtectedRoute>} />
              <Route path="/marcas" element={<ProtectedRoute permission="productos"><Marcas /></ProtectedRoute>} />
              <Route path="/categorias" element={<ProtectedRoute permission="productos"><Categorias /></ProtectedRoute>} />
              <Route path="/rubros" element={<ProtectedRoute permission="productos"><Rubros /></ProtectedRoute>} />
              <Route path="/unidades" element={<ProtectedRoute permission="productos"><Unidades /></ProtectedRoute>} />
              <Route path="/localidades" element={<ProtectedRoute permission="configuracion"><Localidades /></ProtectedRoute>} />
              <Route path="/contabilidad/plan-cuentas" element={<ProtectedRoute permission="contabilidad"><PlanCuentas /></ProtectedRoute>} />
              <Route path="/contabilidad/ejercicios" element={<ProtectedRoute permission="contabilidad"><Ejercicios /></ProtectedRoute>} />
              <Route path="/contabilidad/asientos" element={<ProtectedRoute permission="contabilidad"><Asientos /></ProtectedRoute>} />
              <Route path="/contabilidad/mayor" element={<ProtectedRoute permission="contabilidad"><LibroMayor /></ProtectedRoute>} />
              <Route path="/contabilidad/balance" element={<ProtectedRoute permission="contabilidad"><Balance /></ProtectedRoute>} />
              <Route path="/contabilidad/reportes" element={<ProtectedRoute permission="contabilidad"><ReportesContables /></ProtectedRoute>} />
              <Route path="/ventas" element={<ProtectedRoute permission="ventas"><Ventas /></ProtectedRoute>} />
              <Route path="/ventas/nuevo" element={<ProtectedRoute permission="ventas"><NuevaVenta /></ProtectedRoute>} />
              <Route path="/ventas/:id" element={<ProtectedRoute permission="ventas"><DetalleVenta /></ProtectedRoute>} />
              <Route path="/pedidos" element={<ProtectedRoute permission="ventas"><Pedidos /></ProtectedRoute>} />
              <Route path="/pedidos/nuevo" element={<ProtectedRoute permission="ventas"><NuevoPedido /></ProtectedRoute>} />
              <Route path="/pedidos/:id" element={<ProtectedRoute permission="ventas"><DetallePedido /></ProtectedRoute>} />

              <Route path="/presupuestos" element={<ProtectedRoute permission="ventas"><Presupuestos /></ProtectedRoute>} />
              <Route path="/presupuestos/nuevo" element={<ProtectedRoute permission="ventas"><NuevoPresupuesto /></ProtectedRoute>} />
              <Route path="/presupuestos/:id" element={<ProtectedRoute permission="ventas"><DetallePresupuesto /></ProtectedRoute>} />

              <Route path="/compras" element={<ProtectedRoute permission="compras"><Compras /></ProtectedRoute>} />
              <Route path="/compras/nueva" element={<ProtectedRoute permission="compras"><NuevaCompra /></ProtectedRoute>} />
              <Route path="/compras/:id" element={<ProtectedRoute permission="compras"><DetalleCompra /></ProtectedRoute>} />


              <Route path="/remitos" element={<ProtectedRoute permission="ventas"><Remitos /></ProtectedRoute>} />
              <Route path="/comprobantes/remito/:id" element={<ProtectedRoute permission="ventas"><DetalleRemito /></ProtectedRoute>} />
              <Route path="/comprobantes/nc/:id" element={<ProtectedRoute permission="ventas"><DetalleNotaCredito /></ProtectedRoute>} />
              <Route path="/notas-credito" element={<ProtectedRoute permission="ventas"><NotasCredito /></ProtectedRoute>} />
              <Route path="/notas-debito" element={<ProtectedRoute permission="ventas"><NotasDebito /></ProtectedRoute>} />
              <Route path="/comprobantes/nd/:id" element={<ProtectedRoute permission="ventas"><DetalleNotaDebito /></ProtectedRoute>} />
              <Route path="/proveedores" element={<ProtectedRoute permission="proveedores"><Proveedores /></ProtectedRoute>} />
              <Route path="/caja" element={<ProtectedRoute permission="caja"><Caja /></ProtectedRoute>} />
              <Route path="/caja/" element={<ProtectedRoute permission="caja"><Caja /></ProtectedRoute>} />
              <Route path="/cheques" element={<ProtectedRoute permission="bancos"><Cheques /></ProtectedRoute>} />
              <Route path="/bancos/conciliacion" element={<ProtectedRoute permission="bancos"><ConciliacionBancaria /></ProtectedRoute>} />

              <Route path="/ctas-corrientes/clientes" element={
                <Suspense fallback={<div className="p-5 text-center text-muted"><h2>Cargando Módulo...</h2></div>}>
                  <ProtectedRoute permission="ctacte"><CuentasCorrientesClientes /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/ctas-corrientes/clientes/:id" element={
                <Suspense fallback={<div className="p-5 text-center text-muted"><h2>Cargando...</h2></div>}>
                  <ProtectedRoute permission="ctacte"><DetalleCuentaCorriente /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/ctas-corrientes/proveedores" element={
                <Suspense fallback={<div className="p-5 text-center text-muted"><h2>Cargando...</h2></div>}>
                  <ProtectedRoute permission="ctacte"><CuentasCorrientesProveedores /></ProtectedRoute>
                </Suspense>
              } />

              <Route path="*" element={<div className="p-5" style={{ zIndex: 9999, position: 'relative' }}><h1>REACT 404</h1><p>Pathname: {window.location.pathname}</p></div>} />

              <Route path="/usuarios" element={<ProtectedRoute permission="usuarios"><Usuarios /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// Build trigger v21 - FULL RESTORE
export default App
