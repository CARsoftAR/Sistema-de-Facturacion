
import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Search,
    Maximize2,
    Minimize2,
    Layers,
    Filter,
    Plus,
    MoreHorizontal,
    Edit2,
    Trash2,
    FileText,
    Folder,
    FolderOpen,
    ChevronRight,
    ChevronDown,
    Check,
    X as XIcon
} from 'lucide-react';
import { BtnAdd, BtnCancel, BtnSave, BtnAddWhite, BtnEditWhite, BtnDeleteWhite } from '../components/CommonButtons';
import { showDeleteAlert } from '../utils/alerts';

// ROW COMPONENT (Premium Table Row)
const CuentaRow = ({ cuenta, level, expanded, hasChildren, onToggle, onEdit, onDelete, onAddChild, openDropdownId, setOpenDropdownId }) => {

    // Indentation for tree structure
    const paddingLeft = level * 20;

    return (
        <tr className="group-hover-action hover:bg-light transition-all">
            {/* Código / Jerarquía */}
            <td className="align-middle py-2" style={{ width: '35%' }}>
                <div className="d-flex align-items-center" style={{ paddingLeft: `${paddingLeft}px` }}>
                    {/* Toggle Button */}
                    <div style={{ width: '24px', marginRight: '8px', flexShrink: 0 }} className="d-flex justify-content-center">
                        {hasChildren && (
                            <button
                                className="btn btn-sm p-0 border-0 text-muted hover-text-primary transition-colors d-flex align-items-center justify-content-center"
                                onClick={(e) => { e.stopPropagation(); onToggle(cuenta.id); }}
                                style={{ width: '20px', height: '20px' }}
                            >
                                {expanded ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronRight size={14} strokeWidth={2.5} />}
                            </button>
                        )}
                    </div>

                    {/* Icon */}
                    <div className="me-2 text-primary text-opacity-75">
                        {cuenta.imputable ? (
                            <FileText size={16} className="text-muted" />
                        ) : (
                            expanded ? <FolderOpen size={16} className="text-warning" /> : <Folder size={16} className="text-warning" />
                        )}
                    </div>

                    {/* Code & Name Wrapper for mobile/responsiveness if needed, but here simple text */}
                    <span className={`font-monospace small fw-bold me-2 ${cuenta.imputable ? 'text-secondary' : 'text-dark'}`}>
                        {cuenta.codigo}
                    </span>
                    <span className={`text-truncate ${!cuenta.imputable ? 'fw-bold text-dark' : 'text-dark-emphasis'}`}>
                        {cuenta.nombre}
                    </span>
                </div>
            </td>

            {/* Tipo */}
            <td className="align-middle text-center py-2" style={{ width: '15%' }}>
                <span
                    className="badge rounded-pill fw-normal shadow-sm border"
                    style={{
                        fontSize: '0.7rem',
                        backgroundColor:
                            cuenta.tipo === 'ACTIVO' ? '#f0fdf4' : // green-50
                                cuenta.tipo === 'PASIVO' ? '#fef2f2' : // red-50
                                    cuenta.tipo === 'PN' ? '#eff6ff' : // blue-50
                                        cuenta.tipo === 'R_POS' ? '#f0fdf4' : '#fef2f2',
                        color:
                            cuenta.tipo === 'ACTIVO' ? '#166534' : // green-800
                                cuenta.tipo === 'PASIVO' ? '#991b1b' : // red-800
                                    cuenta.tipo === 'PN' ? '#1e40af' : // blue-800
                                        cuenta.tipo === 'R_POS' ? '#166534' : '#991b1b',
                        borderColor:
                            cuenta.tipo === 'ACTIVO' ? '#bbf7d0' :
                                cuenta.tipo === 'PASIVO' ? '#fecaca' :
                                    cuenta.tipo === 'PN' ? '#bfdbfe' :
                                        cuenta.tipo === 'R_POS' ? '#bbf7d0' : '#fecaca',
                    }}
                >
                    {cuenta.tipo}
                </span>
            </td>

            {/* Imputable */}
            <td className="align-middle text-center py-2" style={{ width: '10%' }}>
                {cuenta.imputable ? (
                    <Check size={16} className="text-success" />
                ) : (
                    <span className="text-muted opacity-25">-</span>
                )}
            </td>

            {/* Acciones Dropdown */}
            <td className="align-middle text-end pe-4 py-2" style={{ width: '15%' }}>
                <div className="position-relative d-inline-block">
                    <button
                        className={`btn btn-sm border shadow-sm d-flex align-items-center gap-1 ${openDropdownId === cuenta.id ? 'btn-primary text-white' : 'btn-light bg-white text-muted'}`}
                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === cuenta.id ? null : cuenta.id); }}
                    >
                        Acciones <ChevronDown size={14} />
                    </button>

                    {openDropdownId === cuenta.id && (
                        <div
                            className="position-absolute end-0 mt-1 bg-white border shadow rounded-3 py-2 fade-in"
                            style={{ zIndex: 1000, minWidth: '180px' }}
                        >
                            <ul className="list-unstyled mb-0 text-start">
                                {!cuenta.imputable && (
                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center py-2 px-3 text-success"
                                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onAddChild(cuenta); }}
                                        >
                                            <Plus size={16} className="me-2" strokeWidth={2.5} /> Agregar Subcuenta
                                        </button>
                                    </li>
                                )}
                                <li>
                                    <button
                                        className="dropdown-item d-flex align-items-center py-2 px-3 text-primary"
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onEdit(cuenta); }}
                                    >
                                        <Edit2 size={16} className="me-2" strokeWidth={2.5} /> Editar
                                    </button>
                                </li>
                                <li><hr className="dropdown-divider mx-2" /></li>
                                <li>
                                    <button
                                        className="dropdown-item d-flex align-items-center py-2 px-3 text-danger"
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onDelete(cuenta.id, cuenta.nombre); }}
                                    >
                                        <Trash2 size={16} className="me-2" strokeWidth={2.5} /> Eliminar
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

const PlanCuentas = () => {
    // Force refresh v4
    console.log("PlanCuentas V4 Loaded - Dropdown");
    const [originalCuentas, setOriginalCuentas] = useState([]);
    const [filteredCuentas, setFilteredCuentas] = useState([]); // Tree structure
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalCount, setTotalCount] = useState(0);

    // Dropdown State
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // Close dropdown backdrop
    const CloseBackdrop = () => (
        openDropdownId ? (
            <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ zIndex: 998 }}
                onClick={() => setOpenDropdownId(null)}
            />
        ) : null
    );


    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20); // Default higher for table view

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        codigo: '',
        nombre: '',
        tipo: 'ACTIVO',
        imputable: true,
        padre_id: null,
        nivel: 1
    });

    const fetchCuentas = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/contabilidad/plan-cuentas/?t=${Date.now()}`);
            const data = await res.json();
            if (data.success) {
                setOriginalCuentas(data.cuentas);
                setFilteredCuentas(data.cuentas);

                // Calculate total count properly and get ALL IDs for expansion
                const allIds = new Set();
                const countNodes = (nodes) => {
                    let count = 0;
                    nodes.forEach(n => {
                        count++;
                        allIds.add(n.id);
                        if (n.hijos && n.hijos.length > 0) count += countNodes(n.hijos);
                    });
                    return count;
                };
                setTotalCount(countNodes(data.cuentas));

                // Auto-expand ALL by default
                setExpandedIds(allIds);
            }
        } catch (error) {
            console.error("Error fetching plan de cuentas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCuentas();
    }, []);

    // Filter Logic
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCuentas(originalCuentas);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        let matchedIds = new Set();

        const filterTree = (nodes) => {
            return nodes.reduce((acc, node) => {
                const matches = node.nombre.toLowerCase().includes(lowerTerm) || node.codigo.includes(lowerTerm);
                let filteredChildren = [];

                if (node.hijos) {
                    filteredChildren = filterTree(node.hijos);
                }

                if (matches || filteredChildren.length > 0) {
                    matchedIds.add(node.id);
                    acc.push({
                        ...node,
                        hijos: filteredChildren
                    });
                }
                return acc;
            }, []);
        };

        const filtered = filterTree(originalCuentas);
        setFilteredCuentas(filtered);

        const getAllIds = (nodes) => {
            let ids = [];
            nodes.forEach(n => {
                ids.push(n.id);
                if (n.hijos) ids = ids.concat(getAllIds(n.hijos));
            });
            return ids;
        };
        setExpandedIds(new Set(getAllIds(filtered)));

        setCurrentPage(1);
    }, [searchTerm, originalCuentas]);


    // Compute Visible Rows (Flattening based on Expansion)
    const getVisibleRows = (nodes, depth = 0) => {
        let rows = [];
        nodes.forEach(node => {
            rows.push({ ...node, visualLevel: depth });
            const isExpanded = expandedIds.has(node.id);
            const hasChildren = node.hijos && node.hijos.length > 0;

            if (isExpanded && hasChildren) {
                rows = rows.concat(getVisibleRows(node.hijos, depth + 1));
            }
        });
        return rows;
    };

    const visibleRows = getVisibleRows(filteredCuentas);

    // Pagination Logic on Visible Rows
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = visibleRows.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(visibleRows.length / itemsPerPage);

    const toggleExpand = (id) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const handleExpandAll = () => {
        const allIds = new Set();
        const traverse = (nodes) => {
            nodes.forEach(n => {
                allIds.add(n.id);
                if (n.hijos) traverse(n.hijos);
            });
        };
        traverse(filteredCuentas);
        setExpandedIds(allIds);
    };

    const handleCollapseAll = () => {
        const rootIds = new Set(filteredCuentas.map(c => c.id));
        setExpandedIds(rootIds);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = formData.id
            ? `/api/contabilidad/plan-cuentas/${formData.id}/editar/`
            : `/api/contabilidad/plan-cuentas/crear/`;

        try {
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

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.ok || data.success) {
                setShowModal(false);
                fetchCuentas();
            } else {
                alert(data.error || "Error al guardar");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await showDeleteAlert(
            `¿Eliminar cuenta ${nombre}?`,
            "Esta acción eliminará la cuenta contable. Si tiene movimientos asociados, no podrá ser eliminada.",
            'Eliminar',
            {
                iconComponent: (
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger mx-auto" style={{ width: '80px', height: '80px' }}>
                        <BookOpen size={40} strokeWidth={1.5} />
                    </div>
                )
            }
        );
        if (!result.isConfirmed) return;

        try {
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

            const res = await fetch(`/api/contabilidad/plan-cuentas/${id}/eliminar/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            const data = await res.json();
            if (data.ok) {
                fetchCuentas();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    const openNew = (parent = null) => {
        setFormData({
            id: null,
            codigo: parent ? `${parent.codigo}.` : '',
            nombre: '',
            tipo: parent ? parent.tipo : 'ACTIVO',
            imputable: true,
            padre_id: parent ? parent.id : null,
            nivel: parent ? parent.nivel + 1 : 1
        });
        setShowModal(true);
    };

    const openEdit = (cuenta) => {
        setFormData({
            id: cuenta.id,
            codigo: cuenta.codigo,
            nombre: cuenta.nombre,
            tipo: cuenta.tipo,
            imputable: cuenta.imputable,
            padre_id: cuenta.padre_id,
            nivel: cuenta.nivel
        });
        setShowModal(true);
    };

    return (
        <div className="container-fluid px-4 pt-4 pb-0 h-100 d-flex flex-column bg-light fade-in">
            <CloseBackdrop />
            <style>{`
                .group-hover-action:hover .group-hover-visible { opacity: 1 !important; }
                .table-container-fixed { min-height: 400px; }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        <BookOpen className="me-2 inline-block" size={32} />
                        Plan de Cuentas
                    </h2>
                    <p className="text-muted mb-0 ps-1" style={{ fontSize: '1rem' }}>
                        Gestión integral de la estructura contable
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <BtnAdd label="Nueva Raíz" icon={BookOpen} onClick={() => openNew(null)} className="btn-lg shadow-sm" />
                </div>
            </div>

            {/* CONTROLS BAR */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body p-2 d-flex flex-wrap gap-2 align-items-center">
                    <div className="position-relative flex-grow-1" style={{ minWidth: '200px' }}>
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input
                            type="text"
                            className="form-control ps-5 border-0 bg-light"
                            placeholder="Buscar por cuenta, código o rubro..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-white border text-muted fw-bold shadow-sm d-flex align-items-center gap-2" onClick={handleExpandAll}>
                            <Maximize2 size={16} /> Expandir
                        </button>
                        <button className="btn btn-white border text-muted fw-bold shadow-sm d-flex align-items-center gap-2" onClick={handleCollapseAll}>
                            <Minimize2 size={16} /> Contraer
                        </button>
                    </div>

                    <div className="vr mx-2 text-muted"></div>

                    <div className="ms-auto text-muted small fw-medium">
                        <Layers size={14} className="me-1" />
                        {totalCount} cuentas
                    </div>
                </div>
            </div>

            {/* TABLE STRUCTURE */}
            <div className="card border-0 shadow mb-0 flex-grow-1 overflow-hidden d-flex flex-column">
                <div className="card-body p-0 d-flex flex-column overflow-hidden">
                    <div className="table-responsive flex-grow-1 table-container-fixed">
                        <table className="table align-middle mb-0">
                            <thead className="table-dark" style={{ backgroundColor: '#212529', color: '#fff' }}>
                                <tr>
                                    <th className="ps-4 py-3 fw-bold">Cuenta / Estructura</th>
                                    <th className="text-center py-3 fw-bold">Rubro</th>
                                    <th className="text-center py-3 fw-bold">Imputable</th>
                                    <th className="text-end pe-4 py-3 fw-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : visibleRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <div className="d-flex flex-column align-items-center">
                                                <div className="bg-light rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                                    <Search className="text-muted text-opacity-50" size={40} />
                                                </div>
                                                <h5 className="text-secondary">No hay cuentas para mostrar</h5>
                                                <p className="text-muted small">Intenta con otros filtros.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    visibleRows.map(c => (
                                        <CuentaRow
                                            key={c.id}
                                            cuenta={c}
                                            level={c.visualLevel}
                                            expanded={expandedIds.has(c.id)}
                                            hasChildren={c.hijos && c.hijos.length > 0}
                                            onToggle={toggleExpand}
                                            onEdit={openEdit}
                                            onDelete={handleDelete}
                                            onAddChild={openNew}
                                            openDropdownId={openDropdownId}
                                            setOpenDropdownId={setOpenDropdownId}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION INSIDE CARD FOOTER */}
                    {!loading && visibleRows.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Mostrando {currentItems.length} de {visibleRows.length} cuentas visibles</span>
                                <select
                                    className="form-select form-select-sm border-secondary-subtle"
                                    style={{ width: '70px' }}
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                >
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                </select>
                                <span className="text-muted small">por pág.</span>
                            </div>

                            <nav>
                                <ul className="pagination mb-0 align-items-center gap-2">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link border-0 text-secondary bg-transparent p-0"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {[...Array(totalPages)].map((_, i) => {
                                        if (totalPages > 10 && Math.abs(currentPage - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) return null;
                                        return (
                                            <li key={i} className="page-item">
                                                <button
                                                    className={`page-link border-0 rounded-circle fw-bold ${currentPage === i + 1 ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary'}`}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {i + 1}
                                                </button>
                                            </li>
                                        );
                                    })}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link border-0 text-secondary bg-transparent p-0"
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL (Same as before) */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)' }}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header bg-white border-0 px-4 pt-4 pb-0">
                                    <div>
                                        <h5 className="modal-title fw-bold fs-4 text-dark mb-0">
                                            {formData.id ? 'Editar Cuenta' : 'Nueva Cuenta'}
                                        </h5>
                                        <p className="text-muted small mb-0">Complete la información de la cuenta contable.</p>
                                    </div>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSave}>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">Código</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light border-0 fw-bold text-primary font-monospace"
                                                    required
                                                    value={formData.codigo}
                                                    onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-8">
                                                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">Nombre de Cuenta</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light border-0 fw-bold"
                                                    required
                                                    value={formData.nombre}
                                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                    placeholder="Ej: Caja Chica"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">Rubro</label>
                                                <select
                                                    className="form-select border-0 bg-light"
                                                    value={formData.tipo}
                                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                                >
                                                    <option value="ACTIVO">Activo</option>
                                                    <option value="PASIVO">Pasivo</option>
                                                    <option value="PN">Patrimonio Neto</option>
                                                    <option value="R_POS">Res. Positivo</option>
                                                    <option value="R_NEG">Res. Negativo</option>
                                                </select>
                                            </div>
                                            <div className="col-12 mt-4">
                                                <div className="form-check form-switch d-flex align-items-center gap-2 p-3 border rounded-3 hover-shadow transition-all cursor-pointer">
                                                    <input
                                                        className="form-check-input fs-5 m-0"
                                                        type="checkbox"
                                                        id="imputableCheck"
                                                        checked={formData.imputable}
                                                        onChange={e => setFormData({ ...formData, imputable: e.target.checked })}
                                                    />
                                                    <div>
                                                        <label className="form-check-label fw-bold d-block text-dark" htmlFor="imputableCheck">
                                                            Cuenta Imputable
                                                        </label>
                                                        <span className="text-muted small">Permite registrar asientos contables directamente.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-5 d-flex justify-content-end gap-2">
                                            <BtnCancel onClick={() => setShowModal(false)} />
                                            <BtnSave />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlanCuentas;
