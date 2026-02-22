import React, { useState, useEffect, useCallback } from 'react';
import {
    Database,
    Download,
    Trash2,
    ShieldCheck,
    History as HistoryIcon,
    PlusCircle,
    HardDrive,
    Search,
    X,
    CheckCircle2,
    ShieldAlert,
    Info,
    RefreshCw,
    Cloud,
    FolderArchive,
    RotateCcw,
    Clock,
    Activity,
    Calendar,
    LogIn,
    LogOut,
    Printer,
    DollarSign
} from 'lucide-react';
import axios from 'axios';
import { showSuccessAlert, showErrorAlert, showDeleteAlert } from '../utils/alerts';
import TablePagination from '../components/common/TablePagination';

const STORAGE_KEY = 'table_prefs_backups';

const Backups = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 10;
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        tipo: 'DB', // DB, DB_JSON, SISTEMA
        ubicacion: 'LOCAL'
    });

    const fetchBackups = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/backups/listar/');
            if (response.data.ok) {
                // El backend devuelve 'data', no 'backups'
                const allData = response.data.data || [];

                // Mapear los campos del backend al formato que espera el frontend
                const mappedData = allData.map(b => ({
                    id: b.id,
                    filename: b.nombre,
                    date: b.fecha,
                    size: b.tamanio,
                    ubicacion: b.ubicacion,
                    tipo: b.tipo
                }));

                setTotalItems(mappedData.length);
                setTotalPages(Math.ceil(mappedData.length / itemsPerPage));

                const start = (page - 1) * itemsPerPage;
                const paginated = mappedData.slice(start, start + itemsPerPage);
                setBackups(paginated);
            }
        } catch (error) {
            console.error("Error cargando backups:", error);
            showErrorAlert('Error', 'No se pudieron cargar los archivos de respaldo');
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage]);

    useEffect(() => {
        fetchBackups();
    }, [fetchBackups]);

    const handleCreateBackup = async (e) => {
        if (e) e.preventDefault();
        setCreating(true);
        setShowCreateModal(false);

        try {
            const response = await axios.post('/api/backups/crear/', createForm);
            if (response.data.ok) {
                await showSuccessAlert(
                    'Éxito',
                    'Respaldo generado correctamente',
                    'OK',
                    { timer: 2000, showConfirmButton: false }
                );
                fetchBackups();
            } else {
                showErrorAlert('Error', response.data.error || 'No se pudo crear el respaldo');
            }
        } catch (error) {
            showErrorAlert('Error', 'Error de conexión con el servidor');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteBackup = async (backupId, backupName) => {
        const result = await showDeleteAlert(
            '¿Eliminar Respaldo?',
            `Esta acción borrará el archivo "${backupName}" permanentemente del servidor.`
        );

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`/api/backups/${backupId}/eliminar/`);
                if (response.data.ok) {
                    await showSuccessAlert('Eliminado', 'El respaldo ha sido borrado');
                    fetchBackups();
                } else {
                    showErrorAlert('Error', response.data.error || 'No se pudo eliminar el archivo');
                }
            } catch (error) {
                showErrorAlert('Error', 'No se pudo completar la eliminación');
            }
        }
    };

    const handleDownload = (backupId) => {
        window.open(`/api/backups/${backupId}/descargar/`, '_blank');
    };

    const handleRestore = async (backupId, filename) => {
        const result = await showDeleteAlert(
            '¡ALERTA CRÍTICA!',
            `Está por RESTAURAR el sistema al punto: ${filename}. Los datos actuales serán reemplazados.`,
            'SÍ, RESTAURAR'
        );

        if (result.isConfirmed) {
            showSuccessAlert('Procesando', 'Iniciando restauración... por favor espere.', 'Aceptar', { timer: 3000 });
            try {
                const response = await axios.post(`/api/backups/${backupId}/restaurar/`);
                if (response.data.ok) {
                    await showSuccessAlert('Éxito', 'Sistema restaurado correctamente. Recargando...');
                    window.location.reload();
                } else {
                    showErrorAlert('Error', response.data.error);
                }
            } catch (error) {
                showErrorAlert('Error', 'No se pudo completar la restauración');
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col fade-in space-y-6">
            {/* Header más compacto y sutil */}
            <div className="relative bg-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-lg border border-slate-700">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[9px] font-bold uppercase tracking-wider mb-1">
                            <ShieldCheck size={12} /> Seguridad de Datos
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Copias de Respaldo
                        </h1>
                        <p className="text-slate-400 text-sm max-w-xl">
                            Gestione los puntos de restauración de su base de datos. Se recomienda realizar una copia diaria.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        disabled={creating}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${creating ? 'bg-slate-700 text-slate-500' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-md'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Database size={18} className={creating ? 'animate-pulse' : ''} />
                            {creating ? 'Procesando...' : 'Generar Copia'}
                        </div>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Info Column */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={16} /></div>
                            Instrucciones
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 text-xs">1</div>
                                <p className="text-slate-600 text-xs leading-relaxed pt-0.5">Haga clic en el botón superior para generar un archivo completo con todos sus datos.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 text-xs">2</div>
                                <p className="text-slate-600 text-xs leading-relaxed pt-0.5">Descargue la copia a un <span className="text-slate-800 font-semibold">disco externo</span> o servicio en la nube.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 text-xs">3</div>
                                <p className="text-slate-600 text-xs leading-relaxed pt-0.5">En caso de pérdida de datos, utilice el botón de restauración para volver al punto deseado.</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2 text-amber-800">
                                <ShieldAlert className="shrink-0" size={18} />
                                <div className="text-[11px] font-semibold leading-snug">
                                    La restauración es un proceso crítico que reemplazará todos los datos actuales. Proceda con precaución.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <HistoryIcon size={14} className="text-blue-600" /> Historial de Copias
                        </h3>
                        <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">{totalItems} registros</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Escaneando archivos...</span>
                            </div>
                        ) : backups.length === 0 ? (
                            <div className="py-16 flex flex-col items-center gap-3 opacity-50">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                    <Database size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-slate-500 text-sm">No hay respaldos disponibles</p>
                                    <p className="text-xs text-slate-400">Genere su primera copia de seguridad ahora.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {backups.map((b) => (
                                    <div key={b.filename} className="p-4 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row justify-between items-center gap-3 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-400 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:text-blue-600 transition-all shadow-sm border border-slate-100">
                                                <Database size={22} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-semibold text-slate-800 text-sm">{b.filename}</h4>
                                                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {b.date}</span>
                                                    <span className="flex items-center gap-1 font-mono">{b.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDownload(b.id)}
                                                className="p-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                                title="Descargar a otra ubicación"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleRestore(b.id, b.filename)}
                                                className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                                                title="Restaurar"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBackup(b.id, b.filename)}
                                                className="p-2 bg-rose-50 border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination Bar */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100">
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

            {/* MODAL: CREAR RESPALDO */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><PlusCircle size={18} /></div>
                                Nuevo Respaldo
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-all"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBackup} className="p-6 space-y-5">
                            <div className="space-y-3">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Seleccione el Tipo</label>
                                <div className="grid grid-cols-1 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setCreateForm({ ...createForm, tipo: 'DB' })}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${createForm.tipo === 'DB' ? 'border-blue-600 bg-blue-50/50 shadow-md scale-[1.01]' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${createForm.tipo === 'DB' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <Database size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">Base de Datos SQL</p>
                                            <p className="text-[11px] text-slate-500">Recomendado para uso diario.</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCreateForm({ ...createForm, tipo: 'SOLO_SISTEMA' })}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${createForm.tipo === 'SOLO_SISTEMA' ? 'border-purple-600 bg-purple-50/50 shadow-md scale-[1.01]' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${createForm.tipo === 'SOLO_SISTEMA' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <FolderArchive size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">Solo Sistema</p>
                                            <p className="text-[11px] text-slate-500">Solo archivos, sin base de datos.</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCreateForm({ ...createForm, tipo: 'SISTEMA' })}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${createForm.tipo === 'SISTEMA' ? 'border-amber-600 bg-amber-50/50 shadow-md scale-[1.01]' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${createForm.tipo === 'SISTEMA' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <RefreshCw size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">Sistema Completo</p>
                                            <p className="text-[11px] text-slate-500">Base de datos + archivos (pesado).</p>
                                        </div>
                                    </button>
                                </div>
                            </div>


                            {/* Ubicación siempre será LOCAL - removido selector */}

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} strokeWidth={2.5} />
                                Iniciar Proceso
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Backups;
