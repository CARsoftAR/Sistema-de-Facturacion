import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, User, RefreshCw, ShieldCheck, Mail, Shield, Pencil, Trash2, Key, Activity, Clock, ShieldAlert, UserCheck } from 'lucide-react';
import UsuarioForm from '../components/usuarios/UsuarioForm';
import { BtnAdd, BtnEdit, BtnDelete, BtnAction, BtnClear } from '../components/CommonButtons';
import { PremiumTable, TableCell } from '../components/premium/PremiumTable';
import { BentoCard, BentoGrid, StatCard } from '../components/premium/BentoCard';
import { SearchInput } from '../components/premium/PremiumInput';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { cn } from '../utils/cn';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // View Management: 'list' | 'form'
    const [view, setView] = useState('list');
    const [editingUsuario, setEditingUsuario] = useState(null);

    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/usuarios/listar/');
            const data = await response.json();
            if (data.ok) {
                setUsuarios(data.data);
            }
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    const handleCreate = () => {
        setEditingUsuario(null);
        setView('form');
    };

    const handleEdit = (usuario) => {
        setEditingUsuario(usuario);
        setView('form');
    };

    const handleDelete = async (id) => {
        const result = await showConfirmationAlert(
            "¿Eliminar usuario?",
            "Esta acción eliminará al usuario del sistema. Perderá el acceso y sus datos de registro permanecerán como histórico.",
            "SÍ, ELIMINAR",
            "danger"
        );
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/usuarios/${id}/eliminar/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            const data = await res.json();
            if (data.ok) {
                showSuccessAlert("Usuario Eliminado", "Se ha actualizado la lista de personal autorizado.");
                fetchUsuarios();
            } else {
                showErrorAlert("Error", data.error || "No se pudo eliminar el usuario.");
            }
        } catch (e) {
            showErrorAlert("Error", "Error de servidor al intentar eliminar.");
        }
    };

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    const filteredUsuarios = useMemo(() => {
        return usuarios.filter(u =>
            u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [usuarios, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: usuarios.length,
            admins: usuarios.filter(u => u.is_staff).length,
            vendedores: usuarios.filter(u => !u.is_staff).length,
            activos: usuarios.filter(u => u.is_active).length
        };
    }, [usuarios]);

    const columns = [
        {
            key: 'username',
            label: 'Usuario / Perfil',
            render: (_, u) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-white flex items-center justify-center font-black text-slate-800 border border-slate-200 shadow-sm uppercase">
                        {u.first_name ? u.first_name.charAt(0) : u.username.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{u.first_name || u.username}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {u.id} • @{u.username}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            label: 'Correo Electrónico',
            render: (v) => (
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold lowercase tracking-wider">
                    <Mail size={12} className="text-slate-300" />
                    <span>{v || '---'}</span>
                </div>
            )
        },
        {
            key: 'is_staff',
            label: 'Rol / Permisos',
            width: '180px',
            align: 'center',
            render: (v) => (
                <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest flex items-center justify-center gap-1.5",
                    v ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                )}>
                    {v ? <ShieldAlert size={12} strokeWidth={3} /> : <UserCheck size={12} strokeWidth={3} />}
                    {v ? 'Administrador' : 'Vendedor'}
                </span>
            )
        },
        {
            key: 'last_login',
            label: 'Último Acceso',
            width: '200px',
            render: (v) => (
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black font-mono">
                    <Clock size={12} />
                    {v ? new Date(v).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'NUNCA'}
                </div>
            )
        },
        {
            key: 'is_active',
            label: 'Estado',
            width: '120px',
            align: 'center',
            render: (v) => (
                <div className="flex items-center justify-center">
                    <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        v ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-slate-300 shadow-none"
                    )} />
                    <span className={cn(
                        "ml-2 text-[10px] font-black uppercase tracking-widest",
                        v ? "text-emerald-700" : "text-slate-400"
                    )}>
                        {v ? 'ACTIVO' : 'BAJA'}
                    </span>
                </div>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '120px',
            align: 'right',
            sortable: false,
            render: (_, u) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-all opacity-0">
                    <button
                        onClick={() => handleEdit(u)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Configurar Perfil"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Dar de Baja"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    if (view === 'form') {
        return (
            <UsuarioForm
                key={editingUsuario?.id || 'new'}
                usuario={editingUsuario}
                onClose={() => setView('list')}
                onSave={() => {
                    fetchUsuarios();
                    setView('list');
                }}
            />
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 flex flex-col p-6 gap-6">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2.5 rounded-2xl text-white shadow-lg shadow-slate-900/20">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Usuarios y Permisos</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] ml-14">
                        Control de identidades y privilegios del sistema.
                    </p>
                </div>

                <BtnAdd
                    label="NUEVO USUARIO"
                    onClick={handleCreate}
                    className="!bg-slate-900 !hover:bg-slate-800 !rounded-xl !px-8 !font-black !tracking-widest !text-[10px] !shadow-xl !shadow-slate-900/20"
                />
            </header>

            {/* Stats */}
            <BentoGrid cols={4}>
                <StatCard
                    label="Total Personal"
                    value={stats.total}
                    icon={User}
                    color="primary"
                />
                <StatCard
                    label="Administradores"
                    value={stats.admins}
                    icon={Shield}
                    color="indigo"
                />
                <StatCard
                    label="Vendedores / Staff"
                    value={stats.vendedores}
                    icon={Activity}
                    color="success"
                />
                <StatCard
                    label="Credenciales Activas"
                    value={stats.activos}
                    icon={Key}
                    color="warning"
                />
            </BentoGrid>

            {/* Main Area */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
                <BentoCard className="p-4 bg-white/80 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput
                                placeholder="Buscar equipo por nombre, email o username..."
                                value={searchTerm}
                                onSearch={setSearchTerm}
                                className="!py-3 border-slate-200"
                            />
                        </div>
                        <button
                            onClick={fetchUsuarios}
                            className="px-6 py-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 font-black text-[10px] tracking-widest flex items-center gap-2 uppercase"
                        >
                            <RefreshCw size={16} strokeWidth={3} /> Sincronizar
                        </button>
                    </div>
                </BentoCard>

                <div className="flex-1 flex flex-col min-h-0">
                    <PremiumTable
                        columns={columns}
                        data={filteredUsuarios}
                        loading={loading}
                        className="flex-1 shadow-lg"
                    />
                    <div className="bg-white border-x border-b border-slate-200 rounded-b-[2rem] px-6 py-4 shadow-premium text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-center">
                        Listado completo de personal con acceso al entorno
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Usuarios;
