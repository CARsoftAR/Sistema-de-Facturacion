import { useState, useEffect, useRef } from 'react';

export const useProductSearch = ({ onSelect }) => {
    const [inputCodigo, setInputCodigo] = useState('');
    const [inputProducto, setInputProducto] = useState('');

    const [codigosSugeridos, setCodigosSugeridos] = useState([]);
    const [productosSugeridos, setProductosSugeridos] = useState([]);

    const [mostrarSugerenciasCodigo, setMostrarSugerenciasCodigo] = useState(false);
    const [mostrarSugerenciasProducto, setMostrarSugerenciasProducto] = useState(false);

    const [sugerenciaCodigoActiva, setSugerenciaCodigoActiva] = useState(0);
    const [sugerenciaActiva, setSugerenciaActiva] = useState(0);

    const codigoListRef = useRef(null);
    const productoListRef = useRef(null);

    // Referencia opcional para focus entre inputs (ej. Código -> Producto)
    const nextInputRef = useRef(null);

    // ==================== BUSCAR POR CÓDIGO ====================
    useEffect(() => {
        if (inputCodigo.length < 1) {
            setCodigosSugeridos([]);
            setMostrarSugerenciasCodigo(false);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`/api/productos/buscar/?q=${encodeURIComponent(inputCodigo)}`)
                .then(res => res.json())
                .then(data => {
                    setCodigosSugeridos(data.data || []);
                    setMostrarSugerenciasCodigo(true);
                    setSugerenciaCodigoActiva(0);
                })
                .catch(() => setCodigosSugeridos([]));
        }, 150);
        return () => clearTimeout(timer);
    }, [inputCodigo]);

    // ==================== BUSCAR PRODUCTO POR NOMBRE ====================
    useEffect(() => {
        if (inputProducto.length < 2) {
            setProductosSugeridos([]);
            setMostrarSugerenciasProducto(false);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`/api/productos/buscar/?q=${encodeURIComponent(inputProducto)}`)
                .then(res => res.json())
                .then(data => {
                    setProductosSugeridos(data.data || []);
                    setMostrarSugerenciasProducto(true);
                    setSugerenciaActiva(0);
                })
                .catch(() => setProductosSugeridos([]));
        }, 200);
        return () => clearTimeout(timer);
    }, [inputProducto]);

    // ==================== SELECCIONAR ====================
    const seleccionar = (producto) => {
        if (!producto) return;

        // Actualizar estados internos
        setInputCodigo(producto.codigo);
        setInputProducto(producto.descripcion);

        // Limpiar sugerencias
        setMostrarSugerenciasProducto(false);
        setMostrarSugerenciasCodigo(false);
        setProductosSugeridos([]);
        setCodigosSugeridos([]);

        // Notificar al componente padre
        if (onSelect) {
            onSelect(producto);
        }
    };

    // ==================== MANEJO DE TECLAS - CÓDIGO ====================
    const handleCodigoKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.min(sugerenciaCodigoActiva + 1, codigosSugeridos.length - 1);
            setSugerenciaCodigoActiva(newIndex);
            const item = codigoListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(sugerenciaCodigoActiva - 1, 0);
            setSugerenciaCodigoActiva(newIndex);
            const item = codigoListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (mostrarSugerenciasCodigo && codigosSugeridos.length > 0) {
                seleccionar(codigosSugeridos[sugerenciaCodigoActiva]);
            } else if (!inputCodigo.trim() && nextInputRef.current) {
                // Si está vacío, saltar al siguiente input (Nombre)
                nextInputRef.current.focus();
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasCodigo(false);
        }
    };

    // ==================== MANEJO DE TECLAS - PRODUCTO ====================
    const handleProductoKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.min(sugerenciaActiva + 1, productosSugeridos.length - 1);
            setSugerenciaActiva(newIndex);
            const item = productoListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(sugerenciaActiva - 1, 0);
            setSugerenciaActiva(newIndex);
            const item = productoListRef.current?.children[newIndex];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (mostrarSugerenciasProducto && productosSugeridos.length > 0) {
                seleccionar(productosSugeridos[sugerenciaActiva]);
            }
        } else if (e.key === 'Escape') {
            setMostrarSugerenciasProducto(false);
        }
    };

    const limpiar = () => {
        setInputCodigo('');
        setInputProducto('');
        setCodigosSugeridos([]);
        setProductosSugeridos([]);
        setMostrarSugerenciasCodigo(false);
        setMostrarSugerenciasProducto(false);
    };

    const handleCodigoBlur = () => setTimeout(() => setMostrarSugerenciasCodigo(false), 200);
    const handleProductoBlur = () => setTimeout(() => setMostrarSugerenciasProducto(false), 200);

    return {
        inputCodigo, setInputCodigo,
        inputProducto, setInputProducto,
        codigosSugeridos,
        productosSugeridos,
        mostrarSugerenciasCodigo,
        mostrarSugerenciasProducto,
        sugerenciaCodigoActiva,
        sugerenciaActiva,
        codigoListRef,
        productoListRef,
        nextInputRef, // Asignar al input de nombre para que el Enter en código salte aquí
        handleCodigoKeyDown,
        handleProductoKeyDown,
        handleCodigoBlur,
        handleProductoBlur,
        seleccionar,
        limpiar
    };
};
