
import { Truck, Plus, Search, Trash2, Phone, Mail, MapPin, X, Save, Building2, CreditCard, RotateCcw, Users, Star, ShieldCheck, Pencil } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BtnAdd, BtnEdit, BtnDelete, BtnAction, BtnClear, BtnGuardar, BtnCancelar } from '../components/CommonButtons';
import { showDeleteAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import TablePagination from '../components/common/TablePagination';
import EmptyState from '../components/EmptyState';
import { StatCard, PremiumTable, TableCell, PremiumFilterBar } from '../components/premium';
import { BentoCard, BentoGrid } from '../components/premium/BentoCard';
import { cn } from '../utils/cn';

const Proveedores = () => {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const STORAGE_KEY = 'table_prefs_proveedores_items';
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = parseInt(saved, 10);
        return (parsed && parsed > 0) ? parsed : 10;
    });

    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            fetch('/api/config/obtener/')
                .then(res => res.json())
                .then(data => {
                    if (data.items_por_pagina) {
                        setItemsPerPage(data.items_por_pagina);
                    }
                })
                .catch(console.error);
        }
    }, []);
    const [busqueda, setBusqueda] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        cuit: '',
        telefono: '',
        email: '',
        direccion: '',
        condicion_fiscal: 'CF',
        cbu: '',
        alias: '',
        notas: ''
    });

    const fetchProveedores = useCallback(async (signal) => {
        setLoading(true);
        try {
            const response = await fetch('/api/proveedores/lista/', { signal });
            const data = await response.json();
            let allProveedores = Array.isArray(data) ? data : (data.data || []);

            if (busqueda) {
                const q = busqueda.toLowerCase();
                allProveedores = allProveedores.filter(p =>
                    p.nombre.toLowerCase().includes(q) ||
                    (p.cuit && p.cuit.includes(q)) ||
                    (p.email && p.email.toLowerCase().includes(q))
                );
            }

            setTotalItems(allProveedores.length);
            setTotalPages(Math.ceil(allProveedores.length / itemsPerPage));

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            setProveedores(allProveedores.slice(start, end));

        } catch (error) {
            if (error.name !== 'AbortError') setProveedores([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, busqueda]);

    useEffect(() => {
        const controller = new AbortController();
        fetchProveedores(controller.signal);
        return () => controller.abort();
    }, [fetchProveedores]);

    const handleEliminar = async (id) => {
        const result = await showDeleteAlert(
            "¿Eliminar proveedor?",
            "Esta acción eliminará al proveedor. Su historial de compras se conservará, pero no podrá asociarse a nuevos comprobantes.",
            'Eliminar',
            {
                iconComponent: (
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger mx-auto" style={{ width: '80px', height: '80px' }}>
                        <Truck size={40} strokeWidth={1.5} />
                    </div>
                )
            }
        );
        if (!result.isConfirmed) return;
        try {
            const response = await fetch(`/api/proveedores/${id}/eliminar/`, { method: 'POST' });
            const data = await response.json();
            if (data.ok || response.ok) {
                fetchProveedores();
            } else {
                alert("Error al eliminar: " + (data.error || "Desconocido"));
            }
        } catch (e) {
            alert("No se pudo eliminar el proveedor.");
        }
    };

    const openModal = (provider = null) => {
        if (provider) {
            setEditingProvider(provider);
            fetch(`/api/proveedores/${provider.id}/`)
                .then(r => r.json())
                .then(data => {
                    setFormData({
                        nombre: data.nombre || '',
                        cuit: data.cuit || '',
                        telefono: data.telefono || '',
                        email: data.email || '',
                        direccion: data.direccion || '',
                        condicion_fiscal: data.condicion_fiscal || 'CF',
                        cbu: data.cbu || '',
                        alias: data.alias || '',
                        notas: data.notas || ''
                    });
                    setShowModal(true);
                })
                .catch(() => {
                    alert("Error al cargar datos del proveedor");
                });
        } else {
            setEditingProvider(null);
            setFormData({
                nombre: '',
                cuit: '',
                telefono: '',
                email: '',
                direccion: '',
                condicion_fiscal: 'CF',
                cbu: '',
                alias: '',
                notas: ''
            });
            setShowModal(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingProvider
            ? `/api/proveedores/${editingProvider.id}/editar/`
            : `/api/proveedores/nuevo/`;

        const formPayload = new FormData();
        Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formPayload
            });
            const data = await response.json();

            if (data.ok || (!data.error && response.ok)) {
                setShowModal(false);
                fetchProveedores();
                showSuccessAlert("Guardado", "Proveedor guardado correctamente");
            } else {
                showErrorAlert("Error", data.error || "No se pudo guardar");
            }
        } catch (error) {
            console.error(error);
            showErrorAlert("Error", "Error de conexión al guardar");
        }
    };

    const columns = [
        {
            key: 'nombre',
            label: 'Proveedor',
            render: (v, p) => (
                <div className="flex flex-col">
                    <span className="font-black text-neutral-800 text-sm uppercase tracking-tight">{v}</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={10} /> {p.direccion || 'Sin dirección registrada'}
                    </span>
                </div>
            )
        },
        {
            key: 'cuit',
            label: 'Identificación',
            width: '160px',
            render: (v, p) => (
                <div className="flex flex-col">
                    {v ? (
                        <span className="font-mono text-xs font-black text-neutral-500 bg-neutral-100 px-2 py-1 rounded border border-neutral-200 w-fit">
                            {v}
                        </span>
                    ) : <span className="text-neutral-300">---</span>}
                    <span className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">{p.condicion_fiscal || 'CF'}</span>
                </div>
            )
        },
        {
            key: 'contacto',
            label: 'Contacto',
            width: '220px',
            render: (_, p) => (
                <div className="flex flex-col gap-0.5">
                    {p.telefono && (
                        <span className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
                            <Phone size={12} className="text-neutral-400" /> {p.telefono}
                        </span>
                    )}
                    {p.email && (
                        <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5 lowercase">
                            <Mail size={12} className="text-neutral-300" /> {p.email}
                        </span>
                    )}
                    {!p.telefono && !p.email && <span className="text-neutral-300">---</span>}
                </div>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'right',
            width: '120px',
            sortable: false,
            render: (_, p) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => openModal(p)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => handleEliminar(p.id)}
                        className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-xl transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50/50">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <Truck className="text-blue-600" size={32} strokeWidth={2.5} />
                        Cartera de Proveedores
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm ml-1">
                        Gestión centralizada de proveedores y condiciones comerciales.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-all shadow-sm">
                        <CreditCard size={18} /> Cta. Corriente
                    </button>
                    <BtnAdd
                        label="NUEVO PROVEEDOR"
                        onClick={() => openModal()}
                        className="!bg-blue-600 !hover:bg-blue-700 !rounded-xl !px-6 !py-3 !font-black !tracking-widest !text-xs !shadow-lg !shadow-blue-600/20"
                    />
                </div>
            </header>

            {/* Stats */}
            <BentoGrid cols={3}>
                <StatCard
                    label="Total Proveedores"
                    value={totalItems}
                    icon={Truck}
                    color="primary"
                />
                <StatCard
                    label="Compras del Mes"
                    value="-- "
                    icon={ShieldCheck}
                    color="success"
                />
                <StatCard
                    label="Proveedores Activos"
                    value={totalItems}
                    icon={Star}
                    color="warning"
                />
            </BentoGrid>

            {/* Filtration & Content */}
            <div className="flex flex-col flex-grow gap-4 min-h-0">
                <PremiumFilterBar
                    busqueda={busqueda}
                    setBusqueda={(v) => { setBusqueda(v); setPage(1); }}
                    showQuickFilters={false}
                    showDateRange={false}
                    onClear={() => { setBusqueda(''); setPage(1); }}
                    placeholder="Buscar por nombre, CUIT o email..."
                />

                <div className="flex-grow flex flex-col min-h-0">
                    <PremiumTable
                        columns={columns}
                        data={proveedores}
                        loading={loading}
                        className="flex-grow shadow-lg"
                        emptyState={
                            <EmptyState
                                title="No se encontraron proveedores"
                                description="Verifica los filtros o agrega un nuevo proveedor a tu base de datos."
                                icon={Truck}
                            />
                        }
                    />

                    <div className="bg-white border-x border-b border-neutral-200 rounded-b-[2rem] px-6 py-1 shadow-premium">
                        <TablePagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setPage}
                            onItemsPerPageChange={(newVal) => {
                                setItemsPerPage(newVal);
                                setPage(1);
                                localStorage.setItem(STORAGE_KEY, newVal);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Premium (Tailwind) */}
            {showModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100 z-10 border border-slate-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <Truck size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                        {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {editingProvider ? 'Modificar datos del proveedor' : 'Dar de alta un nuevo proveedor'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
                            <form id="proveedor-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                                {/* SECCIÓN 1: DATOS PRINCIPALES */}
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Building2 size={16} /> Datos Principales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">RAZÓN SOCIAL / NOMBRE <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all placeholder:font-normal"
                                                placeholder="Ej: Distribuidora S.A."
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 2: INFORMACIÓN FISCAL Y BANCARIA */}
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CreditCard size={16} /> Información Fiscal
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CONDICIÓN FISCAL</label>
                                            <select
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-medium transition-all"
                                                name="condicion_fiscal"
                                                value={formData.condicion_fiscal}
                                                onChange={handleInputChange}
                                            >
                                                <option value="RI">Responsable Inscripto</option>
                                                <option value="MO">Monotributista</option>
                                                <option value="EX">Exento</option>
                                                <option value="CF">Consumidor Final</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CUIT</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all font-mono"
                                                name="cuit"
                                                value={formData.cuit}
                                                onChange={handleInputChange}
                                                placeholder="XX-XXXXXXXX-X"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CBU / CVU</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all font-mono"
                                                name="cbu"
                                                value={formData.cbu}
                                                onChange={handleInputChange}
                                                placeholder="22 dígitos"
                                                maxLength="22"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">ALIAS</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all uppercase"
                                                name="alias"
                                                value={formData.alias}
                                                onChange={handleInputChange}
                                                placeholder="MI.ALIAS"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 3: CONTACTO Y NOTAS */}
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Phone size={16} /> Contacto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">TELÉFONO</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all"
                                                    name="telefono"
                                                    value={formData.telefono}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">DIRECCIÓN</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all"
                                                    name="direccion"
                                                    value={formData.direccion}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">NOTAS</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-normal transition-all"
                                                name="notas"
                                                rows="2"
                                                value={formData.notas}
                                                onChange={handleInputChange}
                                                placeholder="Información adicional..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                            <BtnCancelar onClick={() => setShowModal(false)} />
                            <BtnGuardar label="Guardar" form="proveedor-form" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proveedores;
