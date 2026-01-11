
import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, RotateCcw, ShieldCheck, Mail, Shield, Pencil, Trash2 } from 'lucide-react';
import UsuarioForm from '../components/usuarios/UsuarioForm';
import { BtnAdd, BtnVertical } from '../components/CommonButtons';

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
        if (!window.confirm("¿Está seguro de eliminar este usuario?")) return;

        try {
            const res = await fetch(`/api/usuarios/${id}/eliminar/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            const data = await res.json();
            if (data.ok) {
                fetchUsuarios();
            } else {
                alert(data.error || "No se pudo eliminar el usuario.");
            }
        } catch (e) {
            console.error("Error eliminado", e);
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

    const filteredUsuarios = usuarios.filter(u =>
        u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <div className="container-fluid px-4 pt-4 pb-3 bg-light fade-in main-content-container">
            {/* Header - Matching Ventas.jsx */}
            <div className="d-flex justify-content-between align-items-center mb-4 text-start">
                <div>
                    <h2 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '2rem' }}>
                        <ShieldCheck className="text-primary" size={32} />
                        Gestión de Usuarios
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Administra los accesos y permisos del personal al sistema.
                    </p>
                </div>
                <BtnAdd label="Nuevo Usuario" onClick={handleCreate} className="btn-lg shadow-sm" />
            </div>

            {/* Filtros - Matching Ventas.jsx style */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-light rounded">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por nombre, email o usuario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-1 ms-auto">
                            <button onClick={fetchUsuarios} className="btn btn-white w-100 border text-secondary shadow-sm" title="Actualizar Listado">
                                <RotateCcw size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla - Matching robustness of Ventas.jsx */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0 table-hover">
                            <thead className="bg-white border-bottom position-sticky top-0 z-1 text-start">
                                <tr>
                                    <th className="ps-4 py-3 text-dark fw-bold">Usuario</th>
                                    <th className="py-3 text-dark fw-bold">Email</th>
                                    <th className="py-3 text-dark fw-bold">Rol</th>
                                    <th className="py-3 text-dark fw-bold">Último Acceso</th>
                                    <th className="py-3 text-dark fw-bold">Estado</th>
                                    <th className="text-end pe-4 py-3 text-dark fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-start">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : filteredUsuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <div className="mb-3 opacity-50"><User size={40} /></div>
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsuarios.map(u => (
                                        <tr key={u.id} className="border-bottom-0">
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                                        {u.first_name ? u.first_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{u.first_name || u.username}</div>
                                                        <div className="small text-muted">ID: {u.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Mail size={14} className="text-muted" />
                                                    <span className="small">{u.email || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`badge ${u.is_staff ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'} border-0 px-3`}>
                                                    {u.is_staff ? 'Administrador' : 'Vendedor'}
                                                </span>
                                            </td>
                                            <td className="py-3 small text-muted">
                                                {u.last_login}
                                            </td>
                                            <td className="py-3">
                                                {u.is_active ? (
                                                    <span className="badge bg-success-subtle text-success border-0 px-3 py-2 rounded-pill">Activo</span>
                                                ) : (
                                                    <span className="badge bg-danger-subtle text-danger border-0 px-3 py-2 rounded-pill">Inactivo</span>
                                                )}
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <BtnVertical
                                                        icon={Pencil}
                                                        label="Editar"
                                                        color="warning"
                                                        onClick={() => handleEdit(u)}
                                                        title="Editar Usuario"
                                                    />
                                                    <BtnVertical
                                                        icon={Trash2}
                                                        label="Eliminar"
                                                        color="danger"
                                                        onClick={() => handleDelete(u.id)}
                                                        title="Eliminar Usuario"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Usuarios;
