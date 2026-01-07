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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden transform transition-all scale-100 z-10">

                {/* Header Premium */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <Package size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                {producto ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {producto ? producto.descripcion : 'Alta de artículo en el sistema'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto bg-white flex-1 custom-scrollbar">
                    {serverError && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span className="font-medium text-sm">{serverError}</span>
                        </div>
                    )}

                    <form id="producto-form" onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} autoComplete="off" className="flex flex-col gap-4">

                        {/* SECCIÓN 1: DATOS PRINCIPALES */}
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Tag size={14} /> Información Básica
                            </h3>
                            <div className="grid grid-cols-12 gap-x-4 gap-y-3">
                                <div className="col-span-12 md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">CÓDIGO <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all ${errors.codigo ? 'border-red-300' : ''}`}
                                        placeholder="Ej: A-001"
                                        {...register('codigo', { required: 'Requerido' })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-5">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">DESCRIPCIÓN <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm font-semibold transition-all ${errors.descripcion ? 'border-red-300' : ''}`}
                                        placeholder="Nombre del producto..."
                                        {...register('descripcion', { required: 'Requerido' })}
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">MARCA</label>
                                    <div className="searchable-select-wrapper">
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
                                </div>
                                <div className="col-span-12 md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">UNIDAD</label>
                                    <div className="searchable-select-wrapper">
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
                                </div>

                                <div className="col-span-12 md:col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">RUBRO</label>
                                    <div className="searchable-select-wrapper">
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
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">PROVEEDOR</label>
                                    <div className="searchable-select-wrapper">
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
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">NOTAS</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 text-sm transition-all"
                                        placeholder="Detalles adicionales..."
                                        {...register('descripcion_larga')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2: GRID DOBLE */}
                        <div className="grid grid-cols-12 gap-4">

                            {/* COLUMNA IZQUIERDA: INVENTARIO */}
                            <div className="col-span-12 md:col-span-5 flex flex-col">
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 h-full shadow-sm">
                                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Layers size={16} /> Inventario
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase text-center bg-slate-50 rounded py-1">Stock Actual</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full py-1 px-1 text-center text-3xl font-bold text-slate-700 border-b-2 border-amber-400 focus:outline-none focus:border-amber-500 bg-transparent transition-colors placeholder-slate-200"
                                                    {...register('stock')}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1 space-y-2">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">MÍNIMO</label>
                                                <input type="number" className="w-full px-2 py-1 text-xs font-semibold border border-slate-200 rounded-md text-slate-600" {...register('stock_minimo')} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">MÁXIMO</label>
                                                <input type="number" className="w-full px-2 py-1 text-xs font-semibold border border-slate-200 rounded-md text-slate-600" {...register('stock_maximo')} />
                                            </div>
                                        </div>
                                        <div className="col-span-2 mt-1 pt-2 border-t border-slate-100">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">AJUSTE INICIAL</label>
                                            <input type="number" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50" placeholder="0" {...register('stock_inicial')} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: PRECIOS */}
                            <div className="col-span-12 md:col-span-7 flex flex-col">
                                <div className="bg-white p-4 rounded-2xl border-l-[6px] border-emerald-500 shadow-sm h-full relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <DollarSign size={100} />
                                    </div>
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                                        <DollarSign size={16} /> Costos y Precios
                                    </h3>

                                    <div className="grid grid-cols-12 gap-x-3 gap-y-4 relative z-10">
                                        <div className="col-span-6">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">COSTO NETO</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-slate-400 font-bold">$</span>
                                                </div>
                                                <input
                                                    type="number" step="0.01"
                                                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-700 font-semibold"
                                                    {...register('costo')}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-6">
                                            <label className="block text-xs font-bold text-emerald-600 mb-1">PRECIO VENTA</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-emerald-600 font-bold">$</span>
                                                </div>
                                                <input
                                                    type="number" step="0.01"
                                                    className="w-full pl-7 pr-3 py-2 border-2 border-emerald-400 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-emerald-50 text-emerald-700 font-bold text-lg shadow-sm"
                                                    {...register('precio_efectivo')}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-12">
                                            {watch('costo') > 0 && watch('precio_efectivo') > 0 && (
                                                <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                                    <span className="text-xs font-bold text-emerald-600 uppercase">Margen de Ganancia</span>
                                                    <span className="text-sm font-bold text-emerald-700">
                                                        {(((watch('precio_efectivo') - watch('costo')) / watch('costo')) * 100).toFixed(2)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-12 border-t border-slate-100 my-0"></div>

                                        <div className="col-span-4">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">TARJETA</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-2 text-xs text-slate-400">$</span>
                                                <input type="number" step="0.01" className="w-full pl-5 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 bg-slate-50" {...register('precio_tarjeta')} />
                                            </div>
                                        </div>
                                        <div className="col-span-4">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">CTA. CTE.</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-2 text-xs text-slate-400">$</span>
                                                <input type="number" step="0.01" className="w-full pl-5 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 bg-slate-50" {...register('precio_ctacte')} />
                                            </div>
                                        </div>
                                        <div className="col-span-4">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">MAYORISTA</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-2 text-xs text-slate-400">$</span>
                                                <input type="number" step="0.01" className="w-full pl-5 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 bg-slate-50" {...register('precio_lista4')} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="producto-form"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Save size={18} strokeWidth={2.5} />
                        {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductoForm;
