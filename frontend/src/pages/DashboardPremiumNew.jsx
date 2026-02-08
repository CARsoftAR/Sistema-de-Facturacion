import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown, FiUsers, FiShoppingCart, FiDollarSign, FiActivity, FiAlertTriangle, FiCheck, FiTruck, FiSun, FiMoon } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

import { apiService } from '@/api/api'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

const DashboardPremium = () => {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Estados para los datos
  const [periodo, setPeriodo] = useState('semana')
  const [isLoading, setIsLoading] = useState(true)

  // Consultas al backend
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery(
    ['dashboardStats', periodo],
    () => apiService.dashboard.getStats(),
    {
      refetchInterval: 30000, // Actualizar cada 30 segundos
    }
  )

  const { data: chartData, isLoading: chartLoading } = useQuery(
    ['dashboardChart', periodo],
    () => apiService.dashboard.getChart(periodo),
    {
      enabled: !!statsData,
    }
  )

  const { data: activityData, isLoading: activityLoading } = useQuery(
    'dashboardActivity',
    () => apiService.dashboard.getActivity(),
    {
      refetchInterval: 15000, // Actualizar cada 15 segundos
    }
  )

  useEffect(() => {
    if (statsError) {
      toast.error('Error al cargar las estadísticas del dashboard')
    }
  }, [statsError])

  useEffect(() => {
    if (!statsLoading && !chartLoading && !activityLoading) {
      setIsLoading(false)
    }
  }, [statsLoading, chartLoading, activityLoading])

  const handlePeriodChange = (newPeriod) => {
    setPeriodo(newPeriod)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value) => {
    return value > 0 ? 'text-green-400' : 'text-red-400'
  }

  const getGrowthIcon = (value) => {
    return value > 0 ? <FiTrendingUp /> : <FiTrendingDown />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl font-semibold animate-pulse">
          Cargando Dashboard Premium...
        </div>
      </div>
    )
  }

  const stats = statsData?.data || {
    ventas_mensuales: 24563,
    crecimiento_ventas: 12,
    clientes_activos: 1284,
    crecimiento_clientes: 8,
    pedidos_mes: 847,
    crecimiento_pedidos: -3,
    eficiencia_operativa: 94.2,
  }

  const chart = chartData?.data || {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datos: [3200, 4100, 3800, 5200, 4900, 6100, 5500],
  }

  const activity = activityData?.data || [
    {
      tipo: 'venta',
      titulo: 'Venta #1247',
      descripcion: 'Cliente: Juan Pérez',
      monto: 2456,
      fecha: 'Hace 2 minutos',
      icono: 'shopping-bag',
      color: 'primary'
    },
    {
      tipo: 'cliente',
      titulo: 'Nuevo cliente',
      descripcion: 'María González',
      fecha: 'Hace 15 minutos',
      icono: 'user-plus',
      color: 'secondary'
    },
    {
      tipo: 'alerta',
      titulo: 'Stock bajo: iPhone 15 Pro',
      descripcion: 'Actual: 2 | Mínimo: 5',
      fecha: 'Hace 1 hora',
      icono: 'alert-triangle',
      color: 'warning'
    },
    {
      tipo: 'backup',
      titulo: 'Backup completado',
      descripcion: 'Sistema backup exitoso',
      fecha: 'Hace 3 horas',
      icono: 'check-circle',
      color: 'success'
    },
    {
      tipo: 'compra',
      titulo: 'Orden de compra recibida',
      descripcion: 'Proveedor: TechStore S.A.',
      fecha: 'Hace 5 horas',
      icono: 'truck',
      color: 'primary'
    },
  ]

  const getActivityIcon = (icon) => {
    const iconMap = {
      'shopping-bag': FiShoppingCart,
      'user-plus': FiUsers,
      'alert-triangle': FiAlertTriangle,
      'check-circle': FiCheck,
      'truck': FiTruck,
      'activity': FiActivity,
    }
    return iconMap[icon] || FiActivity
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                🚀 Dashboard Premium
              </h1>
              <span className="text-white/70">
                Bienvenido de nuevo, {user?.username || 'Usuario'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                📊 Dashboard Clásico
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                {theme === 'dark' ? <FiSun className="w-5 h-5 text-yellow-400" /> : <FiMoon className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Revenue Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${getGrowthColor(stats.crecimiento_ventas)}`}>
                {getGrowthIcon(stats.crecimiento_ventas)}
                <span className="text-sm font-medium">{formatPercentage(stats.crecimiento_ventas)}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(stats.ventas_mensuales)}
            </div>
            <div className="text-white/70 text-sm">
              Ingresos Mensuales
            </div>
          </motion.div>

          {/* Customers Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${getGrowthColor(stats.crecimiento_clientes)}`}>
                {getGrowthIcon(stats.crecimiento_clientes)}
                <span className="text-sm font-medium">{formatPercentage(stats.crecimiento_clientes)}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.clientes_activos.toLocaleString()}
            </div>
            <div className="text-white/70 text-sm">
              Clientes Activos
            </div>
          </motion.div>

          {/* Orders Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <FiShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${getGrowthColor(stats.crecimiento_pedidos)}`}>
                {getGrowthIcon(stats.crecimiento_pedidos)}
                <span className="text-sm font-medium">{formatPercentage(stats.crecimiento_pedidos)}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.pedidos_mes.toLocaleString()}
            </div>
            <div className="text-white/70 text-sm">
              Pedidos del Mes
            </div>
          </motion.div>

          {/* Performance Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <FiActivity className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${getGrowthColor(stats.eficiencia_operativa - 100)}`}>
                {getGrowthIcon(stats.eficiencia_operativa - 100)}
                <span className="text-sm font-medium">{formatPercentage(stats.eficiencia_operativa - 100)}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.eficiencia_operativa.toFixed(1)}%
            </div>
            <div className="text-white/70 text-sm">
              Eficiencia Operativa
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Análisis de Ingresos</h2>
              <div className="flex space-x-2">
                {['día', 'semana', 'mes', 'año'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      periodo === p
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 flex items-center justify-center">
              {chartLoading ? (
                <div className="text-white/70">Cargando gráfico...</div>
              ) : (
                <div className="w-full h-full bg-white/5 rounded-lg flex items-center justify-center text-white/70">
                  Gráfico interactivo (Chart.js pronto)
                </div>
              )}
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                <FiActivity className="inline mr-2" />
                Actividad Reciente
              </h2>
              <button className="text-white/70 hover:text-white transition-colors">
                ⋯
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activityLoading ? (
                <div className="text-white/70 text-center py-8">
                  Cargando actividad...
                </div>
              ) : (
                activity.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-lg ${
                      item.color === 'primary' ? 'bg-blue-500' :
                      item.color === 'secondary' ? 'bg-purple-500' :
                      item.color === 'warning' ? 'bg-orange-500' :
                      item.color === 'success' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}>
                      {React.createElement(getActivityIcon(item.icono), { className: "w-4 h-4 text-white" })}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">
                        {item.titulo}
                      </div>
                      <div className="text-white/70 text-xs">
                        {item.descripcion}
                      </div>
                      <div className="text-white/50 text-xs mt-1">
                        {item.fecha}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🧠</div>
            <h2 className="text-xl font-semibold text-white">
              IA Insights
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="text-white font-medium">
                  Oportunidad Detectada
                </div>
                <div className="text-white/70 text-sm">
                  3 clientes tienen compras recurrentes. Ofrece un plan premium para fidelizarlos.
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <div className="text-white font-medium">
                  Alerta Inteligente
                </div>
                <div className="text-white/70 text-sm">
                  2 productos con stock crítico. Reabastecer recomendado en 48 horas.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPremium