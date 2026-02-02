import React, { useState } from 'react';
import {
    Save,
    Trash2,
    Edit,
    Eye,
    Download,
    Upload,
    Plus,
    Search,
    Filter,
    Mail,
    Lock,
    User,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Info,
    AlertTriangle,
} from 'lucide-react';

import {
    // Layout
    BentoCard,
    BentoGrid,
    ActionCard,

    // Forms
    PremiumInput,
    SearchInput,
    PremiumSelect,

    // Buttons
    PremiumButton,
    ButtonGroup,
    IconButton,
    FloatingActionButton,

    // Tables
    PremiumTable,
    TableCell,

    // Modals
    PremiumModal,
    ConfirmModal,
    AlertModal,

    // Stats
    StatCard,
    MiniStatCard,
    StatsGrid,
    ComparisonCard,
    ProgressCard,
} from '../components/premium';

/**
 * ShowcasePremium - Galería de Componentes Premium
 * 
 * Esta página muestra todos los componentes premium disponibles
 * con ejemplos interactivos y código de uso.
 */

const ShowcasePremium = () => {
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    const demoData = [
        { id: 1, nombre: 'Producto A', precio: 1500, stock: 45, categoria: 'Electrónica' },
        { id: 2, nombre: 'Producto B', precio: 2300, stock: 12, categoria: 'Hogar' },
        { id: 3, nombre: 'Producto C', precio: 890, stock: 78, categoria: 'Deportes' },
    ];

    const tableColumns = [
        { key: 'id', label: 'ID', render: (v) => <TableCell.ID value={v} /> },
        { key: 'nombre', label: 'Nombre', render: (v) => <TableCell.Primary value={v} /> },
        { key: 'precio', label: 'Precio', render: (v) => <TableCell.Currency value={v} />, align: 'right' },
        { key: 'stock', label: 'Stock', render: (v) => <TableCell.Secondary value={v} />, align: 'center' },
        { key: 'categoria', label: 'Categoría', render: (v) => <TableCell.Status value={v} variant="default" /> },
    ];

    const Section = ({ title, children }) => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-600 pb-2 inline-block">
                {title}
            </h2>
            {children}
        </div>
    );

    const CodeBlock = ({ children }) => (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{children}</code>
        </pre>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-slate-800 mb-4 text-gradient">
                        Galería de Componentes Premium
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Explora todos los componentes disponibles con ejemplos interactivos y código de uso
                    </p>
                </div>

                {/* Buttons */}
                <Section title="🔘 Botones">
                    <BentoCard>
                        <h3 className="font-bold text-lg mb-4">Variantes</h3>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <PremiumButton variant="primary">Primary</PremiumButton>
                            <PremiumButton variant="secondary">Secondary</PremiumButton>
                            <PremiumButton variant="success">Success</PremiumButton>
                            <PremiumButton variant="warning">Warning</PremiumButton>
                            <PremiumButton variant="error">Error</PremiumButton>
                            <PremiumButton variant="ghost">Ghost</PremiumButton>
                            <PremiumButton variant="outline">Outline</PremiumButton>
                        </div>

                        <h3 className="font-bold text-lg mb-4">Tamaños</h3>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <PremiumButton size="xs">Extra Small</PremiumButton>
                            <PremiumButton size="sm">Small</PremiumButton>
                            <PremiumButton size="md">Medium</PremiumButton>
                            <PremiumButton size="lg">Large</PremiumButton>
                            <PremiumButton size="xl">Extra Large</PremiumButton>
                        </div>

                        <h3 className="font-bold text-lg mb-4">Con Iconos</h3>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <PremiumButton icon={Save} variant="primary">Guardar</PremiumButton>
                            <PremiumButton icon={Trash2} variant="error">Eliminar</PremiumButton>
                            <PremiumButton icon={Download} variant="success">Descargar</PremiumButton>
                            <PremiumButton icon={Upload} variant="outline" iconPosition="right">Subir</PremiumButton>
                        </div>

                        <h3 className="font-bold text-lg mb-4">Estados</h3>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <PremiumButton loading>Cargando...</PremiumButton>
                            <PremiumButton disabled>Deshabilitado</PremiumButton>
                            <PremiumButton fullWidth>Ancho Completo</PremiumButton>
                        </div>

                        <h3 className="font-bold text-lg mb-4">Icon Buttons</h3>
                        <div className="flex flex-wrap gap-3">
                            <IconButton icon={Edit} variant="ghost" aria-label="Editar" />
                            <IconButton icon={Trash2} variant="error" aria-label="Eliminar" />
                            <IconButton icon={Eye} variant="primary" aria-label="Ver" />
                            <IconButton icon={Download} variant="success" aria-label="Descargar" />
                        </div>

                        <CodeBlock>{`<PremiumButton variant="primary" icon={Save}>
  Guardar
</PremiumButton>`}</CodeBlock>
                    </BentoCard>
                </Section>

                {/* Inputs */}
                <Section title="📝 Inputs">
                    <BentoCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PremiumInput
                                label="Input Básico"
                                placeholder="Escribe algo..."
                            />
                            <PremiumInput
                                label="Con Icono"
                                icon={User}
                                placeholder="Nombre de usuario"
                            />
                            <PremiumInput
                                label="Con Error"
                                error="Este campo es requerido"
                                placeholder="Campo con error"
                            />
                            <PremiumInput
                                label="Con Éxito"
                                success="Validación correcta"
                                placeholder="Campo válido"
                            />
                            <PremiumInput
                                label="Email"
                                type="email"
                                icon={Mail}
                                hint="Ingresa tu email"
                                clearable
                            />
                            <PremiumInput
                                label="Contraseña"
                                type="password"
                                icon={Lock}
                                hint="Mínimo 8 caracteres"
                            />
                            <SearchInput
                                placeholder="Buscar productos..."
                                onSearch={(v) => console.log('Buscando:', v)}
                            />
                            <PremiumSelect
                                label="Categoría"
                                options={[
                                    { value: '1', label: 'Electrónica' },
                                    { value: '2', label: 'Hogar' },
                                    { value: '3', label: 'Deportes' },
                                ]}
                            />
                        </div>

                        <CodeBlock>{`<PremiumInput
  label="Email"
  type="email"
  icon={Mail}
  clearable
  error="Email inválido"
/>`}</CodeBlock>
                    </BentoCard>
                </Section>

                {/* Stats */}
                <Section title="📊 Estadísticas">
                    <StatsGrid cols={4}>
                        <StatCard
                            label="Ventas Totales"
                            value="$125,430"
                            icon={DollarSign}
                            trend="up"
                            trendValue="+12.5%"
                            trendLabel="vs mes anterior"
                            color="success"
                        />
                        <StatCard
                            label="Pedidos"
                            value="1,234"
                            icon={ShoppingCart}
                            trend="down"
                            trendValue="-5.2%"
                            trendLabel="vs semana anterior"
                            color="warning"
                        />
                        <StatCard
                            label="Productos"
                            value="456"
                            icon={Package}
                            trend="up"
                            trendValue="+8.1%"
                            color="primary"
                        />
                        <StatCard
                            label="Conversión"
                            value="68.5%"
                            icon={TrendingUp}
                            trend="up"
                            trendValue="+2.3%"
                            color="success"
                        />
                    </StatsGrid>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <ProgressCard
                            label="Meta de Ventas"
                            value={75000}
                            max={100000}
                            color="primary"
                        />
                        <ProgressCard
                            label="Nuevos Clientes"
                            value={68}
                            max={100}
                            color="success"
                        />
                        <ComparisonCard
                            title="Comparativa"
                            metrics={[
                                { label: 'Actual', value: '$45,230', subtitle: '+12%' },
                                { label: 'Anterior', value: '$40,350', subtitle: 'Base' },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <MiniStatCard
                            label="Ticket Promedio"
                            value="$5,453"
                            icon={DollarSign}
                            trend="up"
                        />
                        <MiniStatCard
                            label="Productos Vendidos"
                            value="892"
                            icon={Package}
                            trend="up"
                        />
                    </div>

                    <CodeBlock>{`<StatCard
  label="Ventas Totales"
  value="$125,430"
  icon={DollarSign}
  trend="up"
  trendValue="+12.5%"
  color="success"
/>`}</CodeBlock>
                </Section>

                {/* Tables */}
                <Section title="📋 Tablas">
                    <PremiumTable
                        columns={tableColumns}
                        data={demoData}
                        sortable
                        stickyHeader
                        onRowClick={(row) => console.log('Click en:', row)}
                    />

                    <CodeBlock>{`const columns = [
  { key: 'id', label: 'ID', render: (v) => <TableCell.ID value={v} /> },
  { key: 'precio', label: 'Precio', render: (v) => <TableCell.Currency value={v} /> }
];

<PremiumTable
  columns={columns}
  data={data}
  sortable
  onRowClick={handleClick}
/>`}</CodeBlock>
                </Section>

                {/* Modals */}
                <Section title="🪟 Modales">
                    <BentoCard>
                        <div className="flex flex-wrap gap-3">
                            <PremiumButton onClick={() => setShowModal(true)}>
                                Modal Básico
                            </PremiumButton>
                            <PremiumButton onClick={() => setShowConfirm(true)} variant="warning">
                                Modal de Confirmación
                            </PremiumButton>
                            <PremiumButton onClick={() => setShowAlert(true)} variant="success">
                                Modal de Alerta
                            </PremiumButton>
                        </div>

                        <CodeBlock>{`<PremiumModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título"
  size="md"
  footer={<button>Aceptar</button>}
>
  Contenido del modal
</PremiumModal>`}</CodeBlock>
                    </BentoCard>
                </Section>

                {/* Cards */}
                <Section title="🎴 Cards">
                    <BentoGrid cols={3}>
                        <BentoCard>
                            <h3 className="font-bold mb-2">Card Básico</h3>
                            <p className="text-slate-600">Este es un card básico con contenido.</p>
                        </BentoCard>

                        <BentoCard glass>
                            <h3 className="font-bold mb-2">Card Glass</h3>
                            <p className="text-slate-600">Card con efecto glassmorphism.</p>
                        </BentoCard>

                        <BentoCard hover onClick={() => alert('Click!')}>
                            <h3 className="font-bold mb-2">Card Interactivo</h3>
                            <p className="text-slate-600">Haz click para interactuar.</p>
                        </BentoCard>

                        <ActionCard
                            title="Acción Rápida"
                            description="Card para acciones importantes"
                            icon={Plus}
                            onClick={() => console.log('Acción')}
                            badge="Nuevo"
                        />

                        <BentoCard className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-1">Información</h4>
                                    <p className="text-sm text-blue-700">Card con gradiente personalizado</p>
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-900 mb-1">Éxito</h4>
                                    <p className="text-sm text-green-700">Operación completada</p>
                                </div>
                            </div>
                        </BentoCard>
                    </BentoGrid>

                    <CodeBlock>{`<BentoCard hover glass size="md">
  <h3>Título</h3>
  <p>Contenido del card</p>
</BentoCard>`}</CodeBlock>
                </Section>

                {/* Utility Classes */}
                <Section title="🎨 Clases de Utilidad">
                    <BentoCard>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold mb-3">Sombras</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-white shadow-premium rounded-lg text-center">
                                        <p className="text-sm font-medium">Premium</p>
                                    </div>
                                    <div className="p-4 bg-white shadow-premium-md rounded-lg text-center">
                                        <p className="text-sm font-medium">Medium</p>
                                    </div>
                                    <div className="p-4 bg-white shadow-premium-lg rounded-lg text-center">
                                        <p className="text-sm font-medium">Large</p>
                                    </div>
                                    <div className="p-4 bg-white shadow-premium-xl rounded-lg text-center">
                                        <p className="text-sm font-medium">XL</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold mb-3">Gradientes</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 gradient-primary rounded-lg text-white text-center">
                                        <p className="text-sm font-medium">Primary</p>
                                    </div>
                                    <div className="p-4 gradient-ocean rounded-lg text-white text-center">
                                        <p className="text-sm font-medium">Ocean</p>
                                    </div>
                                    <div className="p-4 gradient-sunset rounded-lg text-white text-center">
                                        <p className="text-sm font-medium">Sunset</p>
                                    </div>
                                    <div className="p-4 gradient-forest rounded-lg text-white text-center">
                                        <p className="text-sm font-medium">Forest</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold mb-3">Badges</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="badge-premium badge-primary">Primary</span>
                                    <span className="badge-premium badge-success">Success</span>
                                    <span className="badge-premium badge-warning">Warning</span>
                                    <span className="badge-premium badge-error">Error</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold mb-3">Animaciones</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg fade-in">
                                        <p className="text-sm font-medium text-center">Fade In</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg slide-up">
                                        <p className="text-sm font-medium text-center">Slide Up</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg scale-in">
                                        <p className="text-sm font-medium text-center">Scale In</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CodeBlock>{`<div className="shadow-premium-lg">Sombra grande</div>
<div className="gradient-ocean">Gradiente océano</div>
<span className="badge-premium badge-success">Badge</span>
<div className="fade-in">Animación fade</div>`}</CodeBlock>
                    </BentoCard>
                </Section>

                {/* FAB */}
                <FloatingActionButton
                    icon={Plus}
                    position="bottom-right"
                    onClick={() => alert('FAB clicked!')}
                />

                {/* Modals */}
                <PremiumModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Modal de Ejemplo"
                    size="md"
                    footer={
                        <div className="flex gap-3 justify-end">
                            <PremiumButton variant="outline" onClick={() => setShowModal(false)}>
                                Cancelar
                            </PremiumButton>
                            <PremiumButton variant="primary" onClick={() => setShowModal(false)}>
                                Aceptar
                            </PremiumButton>
                        </div>
                    }
                >
                    <p className="text-neutral-600">
                        Este es un modal básico con contenido personalizable.
                        Puedes agregar cualquier componente React aquí.
                    </p>
                </PremiumModal>

                <ConfirmModal
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={() => {
                        console.log('Confirmado');
                        setShowConfirm(false);
                    }}
                    title="¿Confirmar acción?"
                    message="Esta acción no se puede deshacer. ¿Deseas continuar?"
                    variant="warning"
                />

                <AlertModal
                    isOpen={showAlert}
                    onClose={() => setShowAlert(false)}
                    title="¡Operación Exitosa!"
                    message="Los cambios se han guardado correctamente."
                    variant="success"
                />
            </div>
        </div>
    );
};

export default ShowcasePremium;
