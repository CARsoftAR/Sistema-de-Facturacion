import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save, Package, DollarSign, Tag, Layers, Barcode, CheckCircle } from 'lucide-react';
import SearchableSelect from '../components/common/SearchableSelect';
import { BtnBack, BtnSave } from '../components/CommonButtons';
import { showWarningAlert, showSuccessAlert } from '../utils/alerts';

const NuevoProducto = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { register, handleSubmit, control, reset, watch, setValue, setFocus, formState: { errors, isSubmitting } } = useForm();

    // Auxiliary Data State
    const [marcas, setMarcas] = useState([]);
    const [rubros, setRubros] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(!!id);

    // Dynamic Fields Watch
    const precioEfectivo = watch('precio_efectivo');
    const costo = watch('costo');
    const [margenDefecto, setMargenDefecto] = useState(0);
    const [metodoGanancia, setMetodoGanancia] = useState('MARKUP');

    // Load Data
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
                setRubros(dataRubros.data || []);
                setProveedores(dataProveedores.data || dataProveedores.proveedores || []);

                // Config
                const resConfig = await fetch('/api/config/obtener/');
                const dataConfig = await resConfig.json();
                if (dataConfig.margen_ganancia_defecto !== undefined) {
                    setMargenDefecto(dataConfig.margen_ganancia_defecto);
                }
                if (dataConfig.metodo_ganancia) {
                    setMetodoGanancia(dataConfig.metodo_ganancia);
                }

                // If editing, fetch product
                if (id) {
                    await fetchProduct(id);
                } else {
                    // Defaults for new product
                    reset({
                        tipo_bulto: 'UN',
                        stock: 0,
                        stock_minimo: 0,
                        stock_maximo: 0,
                        stock_inicial: 0,
                        precio_efectivo: 0,
                        costo: 0,
                        iva_alicuota: 21
                    });
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
                showWarningAlert("Error", "No se pudieron cargar los datos iniciales.");
                setLoading(false);
            }
        };

        fetchData();
    }, [id, reset]);

    // Auto-focus logic
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                if (!id) {
                    setFocus('codigo');
                } else {
                    setFocus('descripcion');
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loading, id, setFocus]);

    const fetchProduct = async (prodId) => {
        try {
            const res = await fetch(`/api/productos/${prodId}/`);
            if (!res.ok) throw new Error("Producto no encontrado");
            const producto = await res.json();

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
                tipo_bulto: producto.tipo_bulto || 'UN',
                iva_alicuota: producto.iva_alicuota || 21
            });
        } catch (e) {
            showWarningAlert("Error", "No se pudo cargar el producto.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCode = async () => {
        try {
            const res = await fetch('/api/productos/generar_codigo/');
            const result = await res.json();
            if (result.ok) {
                setValue('codigo', result.codigo);
            }
        } catch (e) {
            console.error("Error generating code", e);
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        const url = id
            ? `/api/productos/${id}/editar/`
            : '/api/productos/nuevo/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.ok) {
                const msg = result.errors
                    ? Object.values(result.errors).flat().join(', ')
                    : (result.error || 'Ocurrió un error al guardar.');
                showWarningAlert('Atención', msg);
                return;
            }

            showSuccessAlert(
                'Éxito',
                id ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                undefined,
                { timer: 1500, showConfirmButton: false }
            );
            navigate('/productos');
        } catch (error) {
            showWarningAlert('Error', 'Error de conexión con el servidor.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
            const form = e.target.form;
            if (!form) return;
            const elements = Array.from(form.elements).filter(el =>
                !el.disabled && !el.hidden && el.offsetParent !== null && el.tabIndex !== -1 &&
                (el.tagName === 'INPUT' || el.tagName === 'SELECT')
            );
            const index = elements.indexOf(e.target);
            if (index > -1 && index < elements.length - 1) {
                elements[index + 1].focus();
            }
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-semibold">Cargando producto...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col">
            <div className="flex-1 overflow-hidden p-6 flex flex-col">

                {/* Header - Compacto */}
                <div className="mb-4">
                    <div className="flex items-center gap-3">
                        <BtnBack onClick={() => navigate('/productos')} />
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <span className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl text-white shadow-md">
                                    <Package size={20} />
                                </span>
                                {id ? 'Editar Producto' : 'Nuevo Producto'}
                            </h1>
                            <p className="text-sm text-slate-600 font-medium mt-0.5">
                                {id ? 'Modificar datos del artículo' : 'Alta de artículo en el sistema'}
                            </p>
                        </div>
                    </div>
                </div>

                <form id="producto-form" onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} autoComplete="off" className="flex-1 min-h-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

                        {/* COLUMNA IZQUIERDA - Identificación */}
                        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>

                            {/* Card: Identificación */}
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                                        <Tag size={18} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Identificación</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Código <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className={`flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 text-slate-800 text-sm font-bold uppercase transition-all ${errors.codigo ? 'border-red-300' : 'border-slate-200'}`}
                                                placeholder="PROD-001"
                                                {...register('codigo', { required: 'Requerido' })}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleGenerateCode}
                                                className="px-3 bg-white hover:bg-slate-50 text-slate-500 rounded-xl border border-slate-200 transition-all hover:shadow-sm active:scale-95"
                                                title="Autogenerar código"
                                            >
                                                <Barcode size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Descripción <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 text-slate-800 text-sm font-semibold transition-all ${errors.descripcion ? 'border-red-300' : 'border-slate-200'}`}
                                            placeholder="Nombre del producto..."
                                            {...register('descripcion', { required: 'Requerido' })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card: Estado */}
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</span>
                                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle size={14} />
                                        Activo
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* COLUMNA DERECHA - Detalles, Inventario y Precios */}
                        <div className="lg:col-span-2 flex flex-col min-h-0 bg-white rounded-2xl shadow-md border border-slate-200/50 overflow-hidden">

                            {/* Contenido scrolleable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>

                                {/* Card: Clasificación */}
                                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Layers size={14} className="text-blue-500" /> Clasificación y Detalles
                                    </h3>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Marca</label>
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
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Rubro</label>
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
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Unidad</label>
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

                                        <div className="col-span-12 md:col-span-6">
                                            <label className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Proveedor</label>
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
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Alícuota IVA (%)</label>
                                            <select
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 text-slate-800 text-sm font-semibold transition-all appearance-none cursor-pointer"
                                                {...register('iva_alicuota')}
                                            >
                                                <option value="21">21.0%</option>
                                                <option value="10.5">10.5%</option>
                                                <option value="0">0% (Exento)</option>
                                                <option value="27">27.0%</option>
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Notas</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 text-slate-800 text-sm font-medium transition-all"
                                                placeholder="Detalles..."
                                                {...register('descripcion_larga')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Grid: Inventario y Precios */}
                                <div className="grid grid-cols-12 gap-4">

                                    {/* Card: Inventario */}
                                    <div className="col-span-12 md:col-span-5">
                                        <div className="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-sm h-full">
                                            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Layers size={14} /> Inventario
                                            </h3>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 mb-1 uppercase text-center block">Stock Actual</label>
                                                    <input
                                                        type="number"
                                                        className="w-full py-2 text-center text-3xl font-black text-slate-800 border-b-2 border-amber-400 focus:outline-none focus:border-amber-500 bg-transparent transition-all"
                                                        {...register('stock')}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Mínimo</label>
                                                        <input type="number" className="w-full px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 bg-slate-50" {...register('stock_minimo')} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Máximo</label>
                                                        <input type="number" className="w-full px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 bg-slate-50" {...register('stock_maximo')} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Ajuste Inicial</label>
                                                    <input type="number" className="w-full px-3 py-1.5 text-xs font-semibold border border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-500" placeholder="0" {...register('stock_inicial')} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card: Costos y Precios */}
                                    <div className="col-span-12 md:col-span-7">
                                        <div className="bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm h-full">
                                            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <DollarSign size={14} /> Costos y Precios
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] font-bold text-slate-400 mb-1 ml-1 uppercase block">Costo Neto</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">$</span>
                                                            <input
                                                                type="number" step="0.01"
                                                                className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-slate-700 font-bold text-sm transition-all"
                                                                {...register('costo')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-emerald-600 mb-1 ml-1 uppercase block">Precio Venta</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-2 text-emerald-600 font-bold text-xs">$</span>
                                                            <input
                                                                type="number" step="0.01"
                                                                className="w-full pl-6 pr-3 py-2 border-2 border-emerald-400 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-emerald-50/30 text-emerald-700 font-black text-base shadow-sm transition-all"
                                                                {...register('precio_efectivo')}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {watch('costo') > 0 && watch('precio_efectivo') > 0 && (
                                                    <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Margen</span>
                                                        <span className="text-sm font-black text-emerald-700">
                                                            {(((watch('precio_efectivo') - watch('costo')) / watch('costo')) * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 mb-1 ml-1 uppercase block">Tarjeta</label>
                                                        <div className="relative">
                                                            <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400">$</span>
                                                            <input type="number" step="0.01" className="w-full pl-5 pr-1 py-1 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 bg-slate-50" {...register('precio_tarjeta')} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 mb-1 ml-1 uppercase block">Cta. Cte.</label>
                                                        <div className="relative">
                                                            <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400">$</span>
                                                            <input type="number" step="0.01" className="w-full pl-5 pr-1 py-1 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 bg-slate-50" {...register('precio_ctacte')} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 mb-1 ml-1 uppercase block">Mayorista</label>
                                                        <div className="relative">
                                                            <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400">$</span>
                                                            <input type="number" step="0.01" className="w-full pl-5 pr-1 py-1 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 bg-slate-50" {...register('precio_lista4')} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer - Barra de acción */}
                            <div className="p-4 m-4 rounded-2xl bg-slate-900 text-white flex justify-between items-center shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="space-y-0.5">
                                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Atención</p>
                                        <p className="text-xs font-medium text-slate-300">Campos <span className="text-red-400">*</span> obligatorios</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/productos')}
                                        className="text-slate-400 hover:text-white font-bold text-xs transition-colors flex items-center gap-2 group"
                                    >
                                        <X size={14} className="group-hover:rotate-90 transition-transform" />
                                        Cancelar
                                    </button>
                                </div>
                                <BtnSave
                                    form="producto-form"
                                    label={isSubmitting ? 'Guardando...' : (id ? 'Actualizar Producto' : 'Guardar Producto')}
                                    loading={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl font-black text-sm shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NuevoProducto;
