
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SearchableSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Seleccionar...",
    label,
    error,
    disabled = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const selectedOption = options.find(opt => opt.value == value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (val) => {
        onChange({ target: { value: val } });
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            {label && (
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2 px-1">
                    {label}
                </label>
            )}

            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between px-4 !h-[52px] bg-white border rounded-full cursor-pointer transition-all",
                    isOpen ? "border-primary-500 ring-4 ring-primary-500/10 shadow-lg" : "border-neutral-200 shadow-sm",
                    disabled && "opacity-50 cursor-not-allowed bg-neutral-50",
                    error && "border-error-500 ring-error-500/10"
                )}
            >
                <span className={cn(
                    "text-sm font-bold truncate",
                    selectedOption ? "text-neutral-900" : "text-neutral-400"
                )}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {value && !disabled && (
                        <X
                            size={16}
                            className="text-neutral-400 hover:text-neutral-600"
                            onClick={(e) => { e.stopPropagation(); handleSelect(''); }}
                        />
                    )}
                    <ChevronDown size={18} className={cn("text-neutral-400 transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-neutral-200 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                placeholder="Buscar por nombre o código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto p-2 no-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={(e) => { e.stopPropagation(); handleSelect(opt.value); }}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all",
                                        value == opt.value
                                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                    )}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm font-bold text-neutral-400">No se encontraron resultados</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-1.5 px-1 text-xs font-bold text-error-600">{error}</p>}
        </div>
    );
};
