import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, AlertCircle, Package, DollarSign, Tag, Layers, Truck } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';

const ProductoForm = ({ producto, onClose, onSave }) => {
    const { register, handleSubmit, control, reset, watch, formState: { errors, isSubmitting } } = useForm();
    const [marcas, setMarcas] = useState([]);
    const [rubros, setRubros] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [serverError, setServerError] = useState(null);

    // Watch fields for dynamic calculations or UI updates if needed
    const precioEfectivo = watch('precio_efectivo');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resMarcas, resRubros, resProveedores] = await Promise.all([
                    fetch('/api/marcas/listar/'),
                    fetch('/api/rubros/listar/'),
                    fetch('/api/proveedores/lista/')
                ]);

                const dataMarcas = await resMarcas.json();
                const dataRubros = await resRubros.json();
                const dataProveedores = await resProveedores.json();

                setMarcas(dataMarcas.data || []);
                setRubros(dataRubros.length ? dataRubros : []);
                setProveedores(dataProveedores || []);
            } catch (error) {
                console.error("Error cargando datos auxiliares:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (producto) {
            reset({
                codigo: producto.codigo,
                descripcion: producto.descripcion,
                descripcion_larga: producto.descripcion_larga || '',
                marca: producto.marca,
                rubro: producto.rubro,
                proveedor: producto.proveedor,
                stock: producto.stock,
                stock_minimo: producto.stock_minimo || 0,
                stock_maximo: producto.stock_maximo || 0,
                stock_inicial: producto.stock_inicial || 0,
                costo: producto.costo || 0,
                precio_efectivo: producto.precio_efectivo,
                precio_tarjeta: producto.precio_tarjeta || 0,
                precio_ctacte: producto.precio_ctacte || 0,
                precio_lista4: producto.precio_lista4 || 0,
                tipo_bulto: producto.tipo_bulto || 'UN'
            });
        } else {
            reset({
                tipo_bulto: 'UN',
                stock: 0,
                stock_minimo: 0,
                stock_maximo: 0,
                stock_inicial: 0,
                precio_efectivo: 0,
                costo: 0
            });
        }
    }, [producto, reset]);

    const onSubmit = async (data) => {
        setServerError(null);
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        const url = producto
            ? `/api/productos/${producto.id}/editar/`
            : '/api/productos/nuevo/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.ok) {
                if (result.errors) {
                    const msg = Object.values(result.errors).flat().join(', ');
                    setServerError(msg);
                } else {
                    setServerError(result.error || 'Ocurrió un error al guardar.');
                }
                return;
            }

            onSave();
            onClose();
        } catch (error) {
            setServerError('Error de conexión con el servidor.');
        }
    };

    // Custom handler to move focus on Enter instead of submitting
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Allow default behavior for buttons (submission) or textareas (new line)
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;

            e.preventDefault();
            const form = e.target.form;
            if (!form) return;

            const elements = Array.from(form.elements).filter(el =>
                !el.disabled &&
                !el.hidden &&
                el.offsetParent !== null && // Visible check
                el.tabIndex !== -1 &&
                (el.tagName === 'INPUT' || el.tagName === 'SELECT')
            );

            const index = elements.indexOf(e.target);
            if (index > -1 && index < elements.length - 1) {
                elements[index + 1].focus();
            }
        }
    };

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '950px' }}>
                    <div className="modal-content border-0 shadow-lg">

                        {/* Header Compacto */}
                        <div className="modal-header bg-primary text-white py-2 px-3">
                            <div className="d-flex align-items-center gap-2">
                                <Package size={20} className="text-white opacity-75" />
                                <h5 className="modal-title fs-6 fw-bold mb-0">
                                    {producto ? 'Editar Producto' : 'Nuevo Producto'}
                                </h5>
                                <span className="vr mx-2 bg-white opacity-25"></span>
                                <span className="small opacity-75">
                                    {producto ? producto.descripcion : 'Alta de artículo'}
                                </span>
                            </div>
                            <button type="button" className="btn-close btn-close-white small" onClick={onClose}></button>
                        </div>

                        <div className="modal-body p-3 bg-light">
                            {serverError && (
                                <div className="alert alert-danger py-2 mb-3 small d-flex align-items-center">
                                    <AlertCircle size={16} className="me-2" />
                                    <div>{serverError}</div>
                                </div>
                            )}

                            <form id="producto-form" onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>

                                {/* SECCIÓN 1: DATOS PRINCIPALES */}
                                <div className="bg-white p-3 rounded shadow-sm mb-3">
                                    <h6 className="text-secondary fw-bold small text-uppercase border-bottom pb-1 mb-2">Información Básica</h6>
                                    <div className="row g-2">
                                        <div className="col-md-2">
                                            <label className="form-label small text-muted mb-0">Código *</label>
                                            <input type="text" className={`form-control form-control-sm ${errors.codigo ? 'is-invalid' : ''}`} placeholder="Ej: A-001" {...register('codigo', { required: 'Requerido' })} />
                                        </div>
                                        <div className="col-md-5">
                                            <label className="form-label small text-muted mb-0">Descripción *</label>
                                            <input type="text" className={`form-control form-control-sm ${errors.descripcion ? 'is-invalid' : ''}`} placeholder="Nombre..." {...register('descripcion', { required: 'Requerido' })} />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label small text-muted mb-0">Marca</label>
                                            <Controller
                                                name="marca"
                                                control={control}
                                                render={({ field }) => (
                                                    <SearchableSelect
                                                        options={marcas}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="- Marca -"
                                                        name="marca"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label small text-muted mb-0">Unidad</label>
                                            <Controller
                                                name="tipo_bulto"
                                                control={control}
                                                render={({ field }) => (
                                                    <SearchableSelect
                                                        options={[
                                                            { id: 'UN', nombre: 'Unidad' },
                                                            { id: 'KG', nombre: 'Kilos' },
                                                            { id: 'MT', nombre: 'Metros' },
                                                            { id: 'LT', nombre: 'Litros' }
                                                        ]}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Unidad"
                                                        name="tipo_bulto"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label small text-muted mb-0">Rubro</label>
                                            <Controller
                                                name="rubro"
                                                control={control}
                                                render={({ field }) => (
                                                    <SearchableSelect
                                                        options={rubros}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="- Rubro -"
                                                        name="rubro"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted mb-0">Proveedor</label>
                                            <Controller
                                                name="proveedor"
                                                control={control}
                                                render={({ field }) => (
                                                    <SearchableSelect
                                                        options={proveedores}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="- Proveedor -"
                                                        name="proveedor"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted mb-0">Notas</label>
                                            <input type="text" className="form-control form-control-sm" placeholder="Detalles adicionales..." {...register('descripcion_larga')} />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 2: INVENTARIO Y PRECIOS (2 COLUMNAS) */}
                                <div className="row g-3">

                                    {/* COLUMNA IZQUIERDA: INVENTARIO */}
                                    <div className="col-md-5">
                                        <div className="bg-white p-3 rounded shadow-sm h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <Layers size={16} className="text-warning me-2" />
                                                <h6 className="text-secondary fw-bold small text-uppercase mb-0">Inventario</h6>
                                            </div>

                                            <div className="row g-2 align-items-end">
                                                <div className="col-5">
                                                    <label className="form-label small text-dark fw-bold mb-1 d-block text-center bg-light rounded py-1">STOCK REAL</label>
                                                    <input type="number" className="form-control form-control-lg text-center fw-bold border-warning" {...register('stock')} />
                                                </div>
                                                <div className="col-7">
                                                    <div className="row g-2">
                                                        <div className="col-6">
                                                            <label className="form-label small text-muted mb-0" style={{ fontSize: '0.75rem' }}>Mínimo</label>
                                                            <input type="number" className="form-control form-control-sm" {...register('stock_minimo')} />
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="form-label small text-muted mb-0" style={{ fontSize: '0.75rem' }}>Máximo</label>
                                                            <input type="number" className="form-control form-control-sm" {...register('stock_maximo')} />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="form-label small text-muted mb-0" style={{ fontSize: '0.75rem' }}>Inicial (Ajuste)</label>
                                                            <input type="number" className="form-control form-control-sm" {...register('stock_inicial')} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLUMNA DERECHA: PRECIOS */}
                                    <div className="col-md-7">
                                        <div className="bg-white p-3 rounded shadow-sm h-100 border-start border-4 border-success">
                                            <div className="d-flex align-items-center mb-2">
                                                <DollarSign size={16} className="text-success me-2" />
                                                <h6 className="text-secondary fw-bold small text-uppercase mb-0">Costos y Precios</h6>
                                            </div>

                                            <div className="row g-2">
                                                <div className="col-4">
                                                    <label className="form-label small text-muted mb-0">Costo Neto</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text text-muted">$</span>
                                                        <input type="number" step="0.01" className="form-control" {...register('costo')} />
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <label className="form-label small text-success fw-bold mb-0">Precio Venta</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-success text-white border-success">$</span>
                                                        <input type="number" step="0.01" className="form-control border-success fw-bold text-success" {...register('precio_efectivo')} />
                                                    </div>
                                                </div>
                                                <div className="col-4 d-flex align-items-end">
                                                    {watch('costo') > 0 && watch('precio_efectivo') > 0 && (
                                                        <div className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 w-100 py-2">
                                                            MG: {(((watch('precio_efectivo') - watch('costo')) / watch('costo')) * 100).toFixed(0)}%
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-12"><hr className="my-1 text-muted opacity-25" /></div>

                                                <div className="col-4">
                                                    <label className="form-label small text-muted mb-0" style={{ fontSize: '0.75rem' }}>Tarjeta</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text text-muted px-1">$</span>
                                                        <input type="number" step="0.01" className="form-control px-1" {...register('precio_tarjeta')} />
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <label className="form-label small text-muted mb-0" style={{ fontSize: '0.75rem' }}>Cta. Cte.</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text text-muted px-1">$</span>
                                                        <input type="number" step="0.01" className="form-control px-1" {...register('precio_ctacte')} />
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <label className="form-label small text-muted mb-0" style={{ fontSize: '0.75rem' }}>Mayorista</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text text-muted px-1">$</span>
                                                        <input type="number" step="0.01" className="form-control px-1" {...register('precio_lista4')} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Footer Compacto */}
                        <div className="modal-footer py-2 px-3 bg-light border-top-0">
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>Cancelar</button>
                            <button
                                type="submit"
                                form="producto-form"
                                className="btn btn-sm btn-primary px-4 d-flex align-items-center gap-2 shadow-sm"
                                disabled={isSubmitting}
                            >
                                <Save size={16} />
                                {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductoForm;
