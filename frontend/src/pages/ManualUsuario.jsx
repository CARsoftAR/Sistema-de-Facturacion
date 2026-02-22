import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    BookOpen,
    ChevronRight,
    Search,
    Loader2,
    ArrowLeft,
    ScrollText,
    Menu,
    X,
    Activity,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '../utils/cn';

const ManualUsuario = () => {
    const [capitulos, setCapitulos] = useState([]);
    const [selectedSlug, setSelectedSlug] = useState('00_INDICE');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    // Cargar lista de capítulos
    useEffect(() => {
        const fetchCapitulos = async () => {
            try {
                const response = await axios.get('/api/manual/listar/');
                if (response.data.ok) {
                    setCapitulos(response.data.data);
                } else {
                    console.error("API Error (List):", response.data.error);
                }
            } catch (error) {
                console.error("Error cargando capítulos:", error);
                setContent("# Error de Conexión\nNo se pudo contactar con el servidor para listar los capítulos. Verifique su conexión.");
            }
        };
        fetchCapitulos();
    }, []);

    // Cargar contenido del capítulo seleccionado
    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/manual/leer/${selectedSlug}/`);
                if (response.data.ok) {
                    setContent(response.data.content);
                } else {
                    setContent(`# Error\n${response.data.error || "No se pudo cargar el capítulo."}`);
                }
            } catch (error) {
                console.error("Error cargando contenido:", error);
                setContent("# Error de Red\nHubo un problema al intentar descargar el contenido del manual.");
            } finally {
                setLoading(false);
            }
        };
        if (selectedSlug) fetchContent();
    }, [selectedSlug]);

    const filteredCapitulos = capitulos.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        c.slug !== '12_CONTABILIDAD'
    );

    return (
        <div className="flex h-screen bg-neutral-50 overflow-hidden">
            {/* Sidebar Móvil Overlay */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-neutral-200 transform transition-transform duration-300 lg:relative lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Header Sidebar */}
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                                <BookOpen size={20} />
                            </div>
                            <h2 className="font-black text-neutral-800 tracking-tight">Ayuda y Manuales</h2>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Buscador */}
                    <div className="p-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar capítulo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Lista de Capítulos */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {filteredCapitulos.map((cap) => (
                            <button
                                key={cap.slug}
                                onClick={() => {
                                    setSelectedSlug(cap.slug);
                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                    selectedSlug === cap.slug
                                        ? "bg-primary-50 text-primary-700 shadow-sm"
                                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                                )}
                            >
                                <ScrollText size={16} className={cn(
                                    "transition-colors",
                                    selectedSlug === cap.slug ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
                                )} />
                                <span className="flex-1 text-left truncate">{cap.nombre}</span>
                                {selectedSlug === cap.slug && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </nav>

                    {/* Footer Sidebar */}
                    <div className="p-4 border-t border-neutral-100">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all text-sm font-bold"
                        >
                            <ArrowLeft size={16} />
                            Volver al Sistema
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-12 relative">
                    <div className="max-w-4xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-400 gap-4">
                                <Loader2 className="animate-spin text-primary-500" size={40} />
                                <p className="animate-pulse font-medium">Cargando guía...</p>
                            </div>
                        ) : (
                            <div className="prose prose-neutral prose-primary max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Estilos específicos para el Markdown */}
                                <style>{`
                                    .prose h1 { font-weight: 900; color: #171717; letter-spacing: -0.025em; margin-bottom: 2rem; border-bottom: 4px solid #f0f0f0; padding-bottom: 1rem; }
                                    .prose h2 { font-weight: 800; color: #262626; margin-top: 3rem; margin-bottom: 1.5rem; display: flex; items-center: center; gap: 0.5rem; }
                                    .prose h3 { font-weight: 700; color: #404040; margin-top: 2rem; }
                                    .prose p { color: #525252; line-height: 1.8; font-size: 1.05rem; margin-bottom: 1.5rem; }
                                    .prose ul { list-style: none; padding-left: 0; margin-bottom: 2rem; }
                                    .prose li { position: relative; padding-left: 1.75rem; color: #525252; margin-bottom: 0.75rem; }
                                    .prose li::before { content: "→"; position: absolute; left: 0; color: #c2410c; font-weight: bold; }
                                    .prose table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #f5f5f5; border-radius: 1rem; overflow: hidden; margin: 2rem 0; }
                                    .prose th { background: #fafafa; padding: 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #737373; font-weight: 900; border-bottom: 1px solid #f0f0f0; }
                                    .prose td { padding: 1rem; border-bottom: 1px solid #f5f5f5; font-size: 0.95rem; vertical-align: top; }
                                    .prose blockquote { border-left: 4px solid #ea580c; background: #fff7ed; padding: 1.5rem; border-radius: 0 1rem 1rem 0; margin: 2rem 0; }
                                    .prose strong { color: #171717; font-weight: 700; }
                                    .prose code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 0.4rem; font-size: 0.9em; font-weight: 600; color: #c2410c; }
                                `}</style>

                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        a: ({ node, ...props }) => {
                                            const isInternalManual = props.href && props.href.endsWith('.md');
                                            if (isInternalManual) {
                                                return (
                                                    <span
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const slug = props.href.replace('.md', '');
                                                            setSelectedSlug(slug);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="text-primary-600 hover:text-primary-700 font-bold underline cursor-pointer decoration-primary-300 hover:decoration-primary-600 transition-all"
                                                    >
                                                        {props.children}
                                                    </span>
                                                );
                                            }
                                            return <a {...props} target="_blank" rel="noopener noreferrer" />;
                                        },
                                        img: ({ node, ...props }) => {
                                            const [error, setError] = React.useState(false);

                                            if (error) {
                                                return (
                                                    <div className="my-10 p-16 rounded-[2rem] border-2 border-dashed border-neutral-200 bg-neutral-50/50 flex flex-col items-center justify-center gap-6 group hover:border-primary-300 hover:bg-primary-50/20 transition-all duration-500 min-h-[300px]">
                                                        <div className="p-6 bg-white rounded-[1.5rem] shadow-premium-sm text-neutral-200 group-hover:text-primary-400 group-hover:scale-110 group-hover:shadow-primary-600/10 transition-all duration-500">
                                                            <ImageIcon size={64} strokeWidth={1.5} />
                                                        </div>
                                                        <div className="text-center space-y-2">
                                                            <p className="text-neutral-600 font-black text-lg tracking-tight">Cargar captura de pantalla</p>
                                                            <p className="text-neutral-400 text-sm max-w-xs mx-auto">
                                                                Guarda una captura como <code className="bg-neutral-100 px-2 py-0.5 rounded text-primary-600">{props.src.split('/').pop()}</code> en la carpeta <code className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-900">static/manual/</code> para mostrarla aquí.
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="my-10 group cursor-zoom-in relative overflow-hidden rounded-[2rem] border border-neutral-200 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]"
                                                    onClick={() => setPreviewImage(props.src)}>
                                                    <img
                                                        {...props}
                                                        className="w-full h-auto object-cover max-h-[500px]"
                                                        alt={props.alt || "Imagen del manual"}
                                                        onError={() => setError(true)}
                                                    />
                                                    <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/20 transition-all duration-500 flex items-center justify-center backdrop-blur-0 group-hover:backdrop-blur-[2px]">
                                                        <div className="opacity-0 group-hover:opacity-100 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full text-sm font-black text-neutral-900 shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2">
                                                            <Search size={18} className="text-primary-600" />
                                                            Expandir Captura
                                                        </div>
                                                    </div>
                                                    {props.alt && (
                                                        <div className="p-4 bg-neutral-50/80 backdrop-blur-sm border-t border-neutral-100 text-xs text-neutral-500 font-bold tracking-wide text-center uppercase">
                                                            {props.alt}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>

                                {/* Pagination simplistic */}
                                <div className="mt-20 pt-8 border-t border-neutral-100 flex items-center justify-between text-neutral-400 text-sm">
                                    <p>© 2025 Gestión Pro ERP - Manual de Usuario</p>
                                    <div className="flex gap-4">
                                        <button className="hover:text-primary-600 transition-colors">Soporte técnico</button>
                                        <button className="hover:text-primary-600 transition-colors">Reportar error</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Lightbox / Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] bg-neutral-950/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                        <X size={32} />
                    </button>
                    <div className="relative max-w-7xl max-h-full overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-contain cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm font-medium">
                        Presionar en cualquier lugar para cerrar
                    </p>
                </div>
            )}
        </div>
    );
};

export default ManualUsuario;
