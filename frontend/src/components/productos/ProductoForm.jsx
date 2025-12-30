import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, AlertCircle, Package, DollarSign, Tag, Layers, Truck } from 'lucide-react';

const ProductoForm = ({ producto, onClose, onSave }) => {
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
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

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg">

                        {/* Header Moderno */}
                        <div className="modal-header bg-primary text-white px-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-2 bg-white bg-opacity-25 rounded-circle">
                                    <Package size={24} className="text-white" />
                                </div>
                                <div>
                                    <h5 className="modal-title fw-bold mb-0">
                                        {producto ? 'Editar Producto' : 'Nuevo Producto'}
                                    </h5>
                                    <p className="mb-0 small text-white text-opacity-75">
                                        {producto ? `Editando: ${producto.descripcion}` : 'Complete los datos para dar de alta un item'}
                                    </p>
                                </div>
                            </div>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        <div className="modal-body p-4 bg-light">
                            {serverError && (
                                <div className="alert alert-danger d-flex align-items-center mb-4 shadow-sm border-0 border-start border-4 border-danger">
                                    <AlertCircle size={20} className="me-3" />
                                    <div>{serverError}</div>
                                </div>
                            )}

                            <form id="producto-form" onSubmit={handleSubmit(onSubmit)} className="row g-4">

                                {/* 1. Información Básica */}
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Tag size={18} className="text-primary" />
                                                <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ letterSpacing: '0.05em' }}>Información Básica</h6>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 pt-2">
                                            <div className="row g-3">
                                                <div className="col-md-3">
                                                    <label className="form-label small fw-medium text-muted">Código *</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.codigo ? 'is-invalid' : ''}`}
                                                        placeholder="Ej: A-001"
                                                        {...register('codigo', { required: 'Requerido' })}
                                                    />
                                                    {errors.codigo && <div className="invalid-feedback">{errors.codigo.message}</div>}
                                                </div>
                                                <div className="col-md-9">
                                                    <label className="form-label small fw-medium text-muted">Descripción *</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                                                        placeholder="Nombre del producto..."
                                                        {...register('descripcion', { required: 'Requerido' })}
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label small fw-medium text-muted">Marca</label>
                                                    <select className="form-select" {...register('marca')}>
                                                        <option value="">-- Seleccionar --</option>
                                                        {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-medium text-muted">Rubro</label>
                                                    <select className="form-select" {...register('rubro')}>
                                                        <option value="">-- Seleccionar --</option>
                                                        {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-medium text-muted">Unidad</label>
                                                    <select className="form-select" {...register('tipo_bulto')}>
                                                        <option value="UN">Unidad (UN)</option>
                                                        <option value="KG">Kilogramos (KG)</option>
                                                        <option value="MT">Metros (MT)</option>
                                                        <option value="LT">Litros (LT)</option>
                                                    </select>
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label small fw-medium text-muted">Descripción Detallada</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="2"
                                                        placeholder="Información adicional para presupuestos o web..."
                                                        {...register('descripcion_larga')}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Control de Stock */}
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Layers size={18} className="text-warning" />
                                                <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ letterSpacing: '0.05em' }}>Control de Inventario</h6>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 pt-2">
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <div className="p-3 bg-light rounded text-center border border-dashed">
                                                        <label className="form-label d-block small fw-bold text-dark mb-1">STOCK ACTUAL</label>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-lg text-center fw-bold border-0 bg-transparent"
                                                            {...register('stock')}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-8">
                                                    <div className="row g-3">
                                                        <div className="col-md-4">
                                                            <label className="form-label small fw-medium text-muted">Stock Inicial</label>
                                                            <input type="number" className="form-control" {...register('stock_inicial')} />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label className="form-label small fw-medium text-muted">Mínimo</label>
                                                            <input type="number" className="form-control" {...register('stock_minimo')} />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label className="form-label small fw-medium text-muted">Máximo</label>
                                                            <input type="number" className="form-control" {...register('stock_maximo')} />
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                                <Truck size={16} className="text-muted" />
                                                                <select className="form-select form-select-sm border-0 bg-light" {...register('proveedor')}>
                                                                    <option value="">Seleccionar Proveedor Principal...</option>
                                                                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Precios y Costos */}
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm border-start border-3 border-success">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <DollarSign size={18} className="text-success" />
                                                <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ letterSpacing: '0.05em' }}>Precios y Costos</h6>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 pt-2">
                                            <div className="row g-4 align-items-end">
                                                {/* Costo */}
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-bold text-muted">Costo Neto</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0 text-muted">$</span>
                                                        <input
                                                            type="number" step="0.01"
                                                            className="form-control border-start-0"
                                                            {...register('costo')}
                                                        />
                                                    </div>
                                                    <div className="form-text small">Precio de compra sin IVA</div>
                                                </div>

                                                {/* Precio Venta Principal */}
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-bold text-success">Precio Venta (Efectivo)</label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text bg-success text-white border-success">$</span>
                                                        <input
                                                            type="number" step="0.01"
                                                            className="form-control fw-bold border-success text-success"
                                                            {...register('precio_efectivo')}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Calculadora margen simple (Visual) */}
                                                <div className="col-md-4">
                                                    {watch('costo') > 0 && watch('precio_efectivo') > 0 && (
                                                        <div className="p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-25">
                                                            <div className="d-flex justify-content-between text-success smaill fw-medium">
                                                                <span>Margen:</span>
                                                                <span>
                                                                    {(((watch('precio_efectivo') - watch('costo')) / watch('costo')) * 100).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <div className="d-flex justify-content-between text-success small fw-medium">
                                                                <span>Ganancia:</span>
                                                                <span>$ {(watch('precio_efectivo') - watch('costo')).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-12"><hr className="text-muted opacity-25 my-0" /></div>

                                                {/* Precios Secundarios */}
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-medium text-muted">Precio Lista/Tarjeta</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-light border-end-0 text-muted">$</span>
                                                        <input type="number" step="0.01" className="form-control border-start-0" {...register('precio_tarjeta')} />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-medium text-muted">Precio Cta. Cte.</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-light border-end-0 text-muted">$</span>
                                                        <input type="number" step="0.01" className="form-control border-start-0" {...register('precio_ctacte')} />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small fw-medium text-muted">Precio Mayorista</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-light border-end-0 text-muted">$</span>
                                                        <input type="number" step="0.01" className="form-control border-start-0" {...register('precio_lista4')} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top bg-white py-3">
                            <button type="button" className="btn btn-light px-4" onClick={onClose}>Cancelar</button>
                            <button
                                type="submit"
                                form="producto-form"
                                className="btn btn-primary px-4 d-flex align-items-center gap-2 shadow-sm"
                                disabled={isSubmitting}
                            >
                                <Save size={18} />
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
