
import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { BtnAdd, BtnEdit, BtnDelete, BtnAction, BtnIcon, BtnCancel, BtnSave } from '../components/CommonButtons';
import { showDeleteAlert } from '../utils/alerts';

// ROW COMPONENT (Premium Design)
// ROW COMPONENT (Premium Design)
const CuentaRow = ({ cuenta, level, expanded, hasChildren, onToggle, onEdit, onDelete, onAddChild }) => {
    // Indentation color guide based on level
    const bordercolors = ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14'];
    const accentColor = bordercolors[level % bordercolors.length];

    return (
        <div
            className="d-flex align-items-center mb-1 bg-white rounded-3 shadow-sm hover-shadow transition-all position-relative overflow-hidden group-hover-action"
            style={{
                marginLeft: `${level * 24}px`,
                borderLeft: `4px solid ${cuenta.imputable ? '#e9ecef' : accentColor}`,
                transition: 'all 0.2s ease',
            }}
        >
            {/* Toggle / Icon Section */}
            <div className="d-flex align-items-center ps-2 py-3" style={{ width: '50px' }}>
                {hasChildren ? (
                    <button
                        className="btn btn-sm btn-light rounded-circle p-1 text-primary shadow-sm border-0"
                        onClick={() => onToggle(cuenta.id)}
                        style={{ width: '28px', height: '28px', lineHeight: '1' }}
                    >
                        <i className={`bi bi-chevron-${expanded ? 'down' : 'right'} fw-bold`} style={{ fontSize: '0.75rem' }}></i>
                    </button>
                ) : (
                    <div style={{ width: '28px' }}></div>
                )}
            </div>

            {/* Icon Type */}
            <div className="me-3">
                {cuenta.imputable ? (
                    <div className="bg-white border rounded-circle d-flex align-items-center justify-content-center text-secondary shadow-sm" style={{ width: '36px', height: '36px' }}>
                        <i className="bi bi-file-earmark-text-fill fs-5 text-secondary opacity-75"></i>
                    </div>
                ) : (
                    <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: '36px', height: '36px', backgroundColor: `${accentColor}`, color: 'white' }}>
                        <i className={`bi bi-folder${expanded ? '-fill' : '-fill'} fs-5`}></i>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-grow-1 py-2">
                <div className="d-flex align-items-center">
                    <span className="badge bg-light text-secondary border me-2 font-monospace fw-normal" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                        {cuenta.codigo}
                    </span>
                    {/* Badges for Account Type */}
                    <span
                        className="badge rounded-pill fw-normal shadow-sm"
                        style={{
                            fontSize: '0.65rem',
                            backgroundColor:
                                cuenta.tipo === 'ACTIVO' ? '#d1e7dd' :
                                    cuenta.tipo === 'PASIVO' ? '#f8d7da' :
                                        cuenta.tipo === 'PN' ? '#cfe2ff' :
                                            cuenta.tipo === 'R_POS' ? '#d1e7dd' : '#f8d7da',
                            color:
                                cuenta.tipo === 'ACTIVO' ? '#0f5132' :
                                    cuenta.tipo === 'PASIVO' ? '#842029' :
                                        cuenta.tipo === 'PN' ? '#084298' :
                                            cuenta.tipo === 'R_POS' ? '#0f5132' : '#842029',
                            marginLeft: 'auto',
                            order: 2
                        }}
                    >
                        {cuenta.tipo}
                    </span>
                </div>
                <div className={`text-dark text-truncate mt-1 ${!cuenta.imputable ? 'fw-bold' : ''}`} style={{ fontSize: '0.95rem' }}>
                    {cuenta.nombre}
                </div>
            </div>

            {/* Actions (visible on hover) */}
            <div className="d-flex gap-2 pe-3 opacity-0 group-hover-visible transition-opacity">
                {!cuenta.imputable && (
                    <BtnIcon
                        icon="bi-plus-lg"
                        color="success"
                        onClick={() => onAddChild(cuenta)}
                        title="Agregar analítica"
                        size="sm"
                    />
                )}
                <BtnEdit onClick={() => onEdit(cuenta)} />
                <BtnDelete onClick={() => onDelete(cuenta.id, cuenta.nombre)} />
            </div>
        </div>
    );
};

const PlanCuentas = () => {
    const [originalCuentas, setOriginalCuentas] = useState([]);
    const [filteredCuentas, setFilteredCuentas] = useState([]); // Tree structure
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalCount, setTotalCount] = useState(0);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

                // Auto-expand ALL by default so user sees full tree structure immediately
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
            // Restore default expansion (Roots only) if clearing search? 
            // Or keep user state. Let's keep user state but maybe safe to ensure roots are visible.
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        let matchedIds = new Set();

        // Recursively filter tree
        const filterTree = (nodes) => {
            return nodes.reduce((acc, node) => {
                const matches = node.nombre.toLowerCase().includes(lowerTerm) || node.codigo.includes(lowerTerm);
                let filteredChildren = [];

                if (node.hijos) {
                    filteredChildren = filterTree(node.hijos);
                }

                if (matches || filteredChildren.length > 0) {
                    // Add to matched IDs to auto-expand
                    matchedIds.add(node.id); // Expand this node to show its children if they match? 
                    // Actually we want to expand parents of matches.
                    // If filter returns this node, it implies it's visible. 
                    // If we want to see text matches inside, we should expand this node.
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

        // Auto expand all nodes in the filtered result
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
        // Only keep roots expanded, or collapse everything? 
        // Typically Collapse All means collapse everything except roots maybe?
        // Let's collapse to Roots (Level 0)
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
        <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <style>{`
                .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important; transform: translateY(-1px); }
                .group-hover-action:hover .group-hover-visible { opacity: 1 !important; }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-bold mb-1" style={{ fontSize: '2rem', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                        Plan de Cuentas
                    </h1>
                    <p className="text-muted mb-0">Gestión integral de la estructura contable.</p>
                </div>
                <div className="d-flex gap-2">
                    <BtnAdd label="Nueva Raíz" onClick={() => openNew(null)} className="px-4" />
                </div>
            </div>

            {/* CONTROLS BAR */}
            <div className="bg-white p-3 rounded-4 shadow-sm mb-4 d-flex flex-wrap gap-3 align-items-center border">
                <div className="flex-grow-1 position-relative">
                    <i className="bi bi-search position-absolute text-muted" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }}></i>
                    <input
                        type="text"
                        className="form-control border-0 bg-light py-2 ps-5 rounded-2"
                        placeholder="Buscar por cuenta, código o rubro..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ fontSize: '0.95rem' }}
                    />
                </div>
                <div className="d-flex gap-2">
                    <BtnAction label="Expandir" icon="bi-arrows-expand" onClick={handleExpandAll} color="secondary" />
                    <BtnAction label="Contraer" icon="bi-arrows-collapse" onClick={handleCollapseAll} color="secondary" />
                </div>
                <div className="vr mx-1 opacity-25"></div>
                <div className="text-muted small fw-bold">
                    <i className="bi bi-layers-fill me-2 text-primary"></i>
                    {totalCount} cuentas
                </div>
            </div>

            {/* LOADING / EMPTY / LIST */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-3 text-muted">Cargando estructura...</p>
                </div>
            ) : visibleRows.length === 0 ? (
                <div className="text-center py-5">
                    <div className="bg-white rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-search text-muted fs-1"></i>
                    </div>
                    <h5 className="text-secondary">No se encontraron cuentas</h5>
                </div>
            ) : (
                <div className="d-flex flex-column gap-1 pb-5">
                    {currentItems.map(c => (
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
                        />
                    ))}
                </div>
            )}

            {/* PAGINATION */}
            {/* PAGINATION */}
            {!loading && visibleRows.length > 0 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Mostrando {visibleRows.length} cuentas</span>
                        <select
                            className="form-select form-select-sm border-secondary-subtle"
                            style={{ width: '70px' }}
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
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

            {/* MODAL (Redesigned) */}
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
