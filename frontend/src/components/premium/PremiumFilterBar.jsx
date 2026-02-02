import React from 'react';
import { Clock, FilterX } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SearchInput } from './PremiumInput';

/**
 * PremiumFilterBar - Reusable Filter Component matching the new design tokens
 * Includes: Search Input, Quick Date Selectors (Hoy/Ayer), Date Range, and Clear button
 */
export const PremiumFilterBar = ({
    busqueda,
    setBusqueda,
    dateRange,
    setDateRange,
    onClear,
    placeholder = "Buscar...",
    showQuickFilters = true,
    showDateRange = true,
    className = "",
    children
}) => {
    const getLocalDate = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const setToday = () => {
        const today = getLocalDate();
        setDateRange({ start: today, end: today });
    };

    const setYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDate(yesterday);
        setDateRange({ start: yesterdayStr, end: yesterdayStr });
    };

    const isToday = dateRange.start === getLocalDate() && dateRange.end === getLocalDate();
    const isYesterday = dateRange.start === getLocalDate(new Date(new Date().setDate(new Date().getDate() - 1))) && dateRange.end === getLocalDate(new Date(new Date().setDate(new Date().getDate() - 1)));

    return (
        <div className={cn("flex flex-col lg:flex-row items-center gap-4 py-0 px-2 w-full", className)}>
            {/* Search Input - Pill styled */}
            <div className="flex-1 w-full overflow-visible">
                <SearchInput
                    placeholder={placeholder}
                    value={busqueda}
                    onSearch={setBusqueda}
                    className="!h-[52px] !rounded-full border-neutral-200 shadow-sm bg-white"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Hoy/Ayer Selectors - Pill styled */}
                {showQuickFilters && (
                    <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-neutral-200 h-[52px] shadow-sm">
                        <button
                            type="button"
                            onClick={setToday}
                            className={cn(
                                "px-6 h-full text-[10px] font-black rounded-full transition-all tracking-widest uppercase",
                                isToday
                                    ? "bg-primary-50 text-primary-600 shadow-sm"
                                    : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                            )}
                        >
                            HOY
                        </button>
                        <button
                            type="button"
                            onClick={setYesterday}
                            className={cn(
                                "px-6 h-full text-[10px] font-black rounded-full transition-all tracking-widest uppercase",
                                isYesterday
                                    ? "bg-primary-50 text-primary-600 shadow-sm"
                                    : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                            )}
                        >
                            AYER
                        </button>
                    </div>
                )}

                {/* Date Range - Pill styled */}
                {showDateRange && (
                    <div className="flex items-center gap-3 bg-white px-6 h-[52px] rounded-full border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-neutral-400" />
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Desde</span>
                            <input
                                type="date"
                                name="start"
                                value={dateRange.start}
                                onChange={handleDateChange}
                                className="text-xs font-bold text-neutral-700 bg-transparent outline-none cursor-pointer hover:text-primary-600 transition-colors uppercase"
                            />
                        </div>
                        <div className="w-[1px] h-4 bg-neutral-200 mx-1"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Hasta</span>
                            <input
                                type="date"
                                name="end"
                                value={dateRange.end}
                                onChange={handleDateChange}
                                className="text-xs font-bold text-neutral-700 bg-transparent outline-none cursor-pointer hover:text-primary-600 transition-colors uppercase"
                            />
                        </div>
                    </div>
                )}

                {/* Additional Filters (Children) */}
                {children}

                {/* Clear Button - Pill styled */}
                <button
                    type="button"
                    onClick={onClear}
                    className="h-[52px] w-[52px] flex items-center justify-center text-neutral-400 hover:text-primary-600 bg-white border border-neutral-200 rounded-full transition-all shadow-sm group flex-shrink-0"
                    title="Limpiar Filtros"
                >
                    <FilterX size={20} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default PremiumFilterBar;
