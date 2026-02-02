import React, { useState } from 'react';
import {
    DollarSign,
    ShoppingCart,
    Package,
    TrendingUp,
    Users,
    AlertCircle,
    FileText,
    Calendar,
    ArrowRight,
    Plus,
    Download,
    Filter,
} from 'lucide-react';
import {
    BentoGrid,
    BentoCard,
    StatsGrid,
    StatCard,
    MiniStatCard,
    ProgressCard,
    ComparisonCard,
    PremiumButton,
    PremiumTable,
    TableCell,
    SearchInput,
    PremiumModal,
} from '../components/premium';

/**
 * DashboardPremium - Ejemplo de Dashboard con UI/UX Premium
 * 
 * Este componente demuestra el uso de todos los componentes premium
 * en un dashboard real de sistema de facturación.
 */

const DashboardPremium = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Datos de ejemplo
    const stats = {
        ventasMes: 125430,
        pedidosPendientes: 23,
        productosStock: 1234,
        clientesActivos: 456,
    };

    const recentSales = [
        { id: 1001, cliente: 'Juan Pérez', fecha: '2026-01-31', monto: 15430, estado: 'Completado' },
        { id: 1002, cliente: 'María García', fecha: '2026-01-31', monto: 8920, estado: 'Pendiente' },
        { id: 1003, cliente: 'Carlos López', fecha: '2026-01-30', monto: 23450, estado: 'Completado' },
        { id: 1004, cliente: 'Ana Martínez', fecha: '2026-01-30', monto: 12100, estado: 'Completado' },
        { id: 1005, cliente: 'Pedro Rodríguez', fecha: '2026-01-29', monto: 6780, estado: 'Cancelado' },
    ];

    const tableColumns = [
        {
            key: 'id',
            label: 'ID',
            render: (val) => <TableCell.ID value={val} />,
        },
        {
            key: 'cliente',
            label: 'Cliente',
            render: (val) => <TableCell.Primary value={val} />,
        },
        {
            key: 'fecha',
            label: 'Fecha',
            render: (val) => <TableCell.Date value={val} />,
        },
        {
            key: 'monto',
            label: 'Monto',
            render: (val) => <TableCell.Currency value={val} />,
            align: 'right',
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => {
                const variant = val === 'Completado' ? 'success' : val === 'Pendiente' ? 'warning' : 'error';
                return <TableCell.Status value={val} variant={variant} />;
            },
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 mb-2 text-gradient">
                            Dashboard Premium
                        </h1>
                        <p className="text-slate-600 font-medium flex items-center gap-2">
                            <Calendar size={16} />
                            Viernes, 31 de Enero 2026
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <PremiumButton
                            variant="outline"
                            icon={Filter}
                            size="md"
                        >
                            Filtros
                        </PremiumButton>
                        <PremiumButton
                            variant="primary"
                            icon={Download}
                            size="md"
                        >
                            Exportar
                        </PremiumButton>
                    </div>
                </div>

                {/* KPI Cards */}
                <StatsGrid cols={4}>
                    <StatCard
                        label="Ventas del Mes"
                        value={`$${stats.ventasMes.toLocaleString('es-AR')}`}
                        icon={DollarSign}
                        trend="up"
                        trendValue="+12.5%"
                        trendLabel="vs mes anterior"
                        color="success"
                        onClick={() => console.log('Ver detalle ventas')}
                    />
                    <StatCard
                        label="Pedidos Pendientes"
                        value={stats.pedidosPendientes}
                        icon={ShoppingCart}
                        trend="down"
                        trendValue="-5.2%"
                        trendLabel="vs semana anterior"
                        color="warning"
                        onClick={() => console.log('Ver pedidos')}
                    />
                    <StatCard
                        label="Productos en Stock"
                        value={stats.productosStock.toLocaleString('es-AR')}
                        icon={Package}
                        trend="up"
                        trendValue="+8.1%"
                        trendLabel="nuevos productos"
                        color="primary"
                        onClick={() => console.log('Ver inventario')}
                    />
                    <StatCard
                        label="Clientes Activos"
                        value={stats.clientesActivos}
                        icon={Users}
                        trend="up"
                        trendValue="+15.3%"
                        trendLabel="este trimestre"
                        color="success"
                        onClick={() => console.log('Ver clientes')}
                    />
                </StatsGrid>

                {/* Main Content Grid */}
                <BentoGrid cols={3}>
                    {/* Progreso de Objetivos */}
                    <div className="lg:col-span-2 space-y-6">
                        <BentoCard>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800">
                                    Objetivos del Mes
                                </h2>
                                <PremiumButton
                                    variant="ghost"
                                    icon={ArrowRight}
                                    iconPosition="right"
                                    size="sm"
                                >
                                    Ver todos
                                </PremiumButton>
                            </div>
                            <div className="space-y-4">
                                <ProgressCard
                                    label="Meta de Ventas"
                                    value={125430}
                                    max={150000}
                                    color="primary"
                                />
                                <ProgressCard
                                    label="Nuevos Clientes"
                                    value={68}
                                    max={100}
                                    color="success"
                                />
                                <ProgressCard
                                    label="Productos Vendidos"
                                    value={892}
                                    max={1000}
                                    color="warning"
                                />
                            </div>
                        </BentoCard>

                        {/* Tabla de Ventas Recientes */}
                        <BentoCard className="p-0">
                            <div className="p-6 border-b border-neutral-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        Ventas Recientes
                                    </h2>
                                    <SearchInput
                                        onSearch={setSearchQuery}
                                        placeholder="Buscar venta..."
                                        className="w-64"
                                    />
                                </div>
                            </div>
                            <PremiumTable
                                columns={tableColumns}
                                data={recentSales}
                                sortable
                                onRowClick={(row) => console.log('Ver venta:', row)}
                            />
                        </BentoCard>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Acciones Rápidas */}
                        <BentoCard glass>
                            <h3 className="text-lg font-bold text-slate-800 mb-4">
                                Acciones Rápidas
                            </h3>
                            <div className="space-y-3">
                                <PremiumButton
                                    variant="primary"
                                    icon={Plus}
                                    fullWidth
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Nueva Venta
                                </PremiumButton>
                                <PremiumButton
                                    variant="outline"
                                    icon={FileText}
                                    fullWidth
                                >
                                    Nuevo Pedido
                                </PremiumButton>
                                <PremiumButton
                                    variant="outline"
                                    icon={Package}
                                    fullWidth
                                >
                                    Agregar Producto
                                </PremiumButton>
                                <PremiumButton
                                    variant="outline"
                                    icon={Users}
                                    fullWidth
                                >
                                    Nuevo Cliente
                                </PremiumButton>
                            </div>
                        </BentoCard>

                        {/* Comparativa */}
                        <ComparisonCard
                            title="Comparativa Mensual"
                            metrics={[
                                {
                                    label: 'Este Mes',
                                    value: '$125,430',
                                    subtitle: '+12.5%',
                                },
                                {
                                    label: 'Mes Anterior',
                                    value: '$111,500',
                                    subtitle: 'Base',
                                },
                            ]}
                        />

                        {/* Alertas */}
                        <BentoCard className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-900 mb-1">
                                        Stock Bajo
                                    </h4>
                                    <p className="text-sm text-amber-700">
                                        15 productos requieren reposición
                                    </p>
                                    <PremiumButton
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 text-amber-700 hover:bg-amber-100"
                                    >
                                        Ver productos
                                    </PremiumButton>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Mini Stats */}
                        <div className="space-y-3">
                            <MiniStatCard
                                label="Ticket Promedio"
                                value="$5,453"
                                icon={TrendingUp}
                                trend="up"
                                color="success"
                            />
                            <MiniStatCard
                                label="Conversión"
                                value="68.5%"
                                icon={TrendingUp}
                                trend="up"
                                color="primary"
                            />
                        </div>
                    </div>
                </BentoGrid>

                {/* Modal de Ejemplo */}
                <PremiumModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Nueva Venta"
                    size="lg"
                    variant="default"
                    footer={
                        <div className="flex gap-3 justify-end">
                            <PremiumButton
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancelar
                            </PremiumButton>
                            <PremiumButton
                                variant="primary"
                                icon={Plus}
                                onClick={() => {
                                    console.log('Crear venta');
                                    setIsModalOpen(false);
                                }}
                            >
                                Crear Venta
                            </PremiumButton>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-neutral-600">
                            Aquí iría el formulario de nueva venta con todos los campos necesarios.
                        </p>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Tip:</strong> Usa el lector de código de barras para agregar productos rápidamente.
                            </p>
                        </div>
                    </div>
                </PremiumModal>
            </div>
        </div>
    );
};

export default DashboardPremium;
