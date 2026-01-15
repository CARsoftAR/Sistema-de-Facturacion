import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

const SearchableSelect = ({ options = [], value, onChange, placeholder = "Seleccionar...", name, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Find selected item to display its label
    const selectedItem = options.find(opt => String(opt.id) === String(value));

    // Update search term when value changes externally
    useEffect(() => {
        if (selectedItem) {
            setSearchTerm(selectedItem.nombre || selectedItem.label);
        } else {
            setSearchTerm('');
        }
    }, [selectedItem, value]);

    // Filter options based on search term
    // If searchTerm matches the selected item exactly, show all options (user is just viewing)
    // Otherwise, filter.
    const filteredOptions = options.filter(opt => {
        const label = (opt.nombre || opt.label || '').toString().toLowerCase();
        const term = searchTerm.toLowerCase();
        // If the current term exactly matches the selected item, don't filter (show all context)
        if (selectedItem && (selectedItem.nombre || selectedItem.label).toLowerCase() === term) return true;
        return label.includes(term);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                // Reset search term to selected value on blur if no new selection was made
                if (selectedItem) {
                    setSearchTerm(selectedItem.nombre || selectedItem.label);
                } else if (!value) {
                    setSearchTerm('');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedItem, value]);

    const handleSelect = (option) => {
        onChange(option.id);
        setSearchTerm(option.nombre || option.label);
        setIsOpen(false);
        // Focus back to input but keep it closed usually, 
        // strictly speaking we might want to move focus to next field but that's parent responsibility
    };

    const handleKeyDown = (e) => {
        if (disabled) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
            setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setIsOpen(true);
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            if (isOpen && filteredOptions.length > 0) {
                e.preventDefault();
                e.stopPropagation(); // Stop form from submitting or moving to next field
                handleSelect(filteredOptions[highlightedIndex]);
            }
            // If closed, let event bubble so parent form can handle moving to next field
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'Tab') {
            setIsOpen(false);
        }
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
        setHighlightedIndex(0);
        // Verify if cleared. Optional: onChange(null) if clear allowed.
        if (e.target.value === '') {
            // onChange(null); // Uncomment if you want live clearing
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700 text-sm transition-all shadow-sm"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsOpen(true);
                        inputRef.current.select();
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    autoComplete="off"
                    name={name}
                />
                <div className="absolute right-0 top-0 h-full px-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                </div>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto ring-1 ring-black/5 custom-scrollbar"
                    style={{ top: '100%' }}>
                    {filteredOptions.map((opt, index) => (
                        <li
                            key={opt.id}
                            className={`px-4 py-2.5 text-sm cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors ${index === highlightedIndex ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            onClick={() => handleSelect(opt)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <div className="flex items-center justify-between">
                                <span>{opt.nombre || opt.label}</span>
                                {(String(opt.id) === String(value)) && <Check size={16} className="text-blue-600" />}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && filteredOptions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl p-3 text-center" style={{ top: '100%' }}>
                    <p className="text-sm text-slate-400 italic">No hay resultados</p>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
