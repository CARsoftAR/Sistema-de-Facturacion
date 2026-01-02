import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

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
        <div className="position-relative" ref={wrapperRef}>
            <div className="input-group input-group-sm">
                <input
                    ref={inputRef}
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsOpen(true);
                        // Select text on focus for easy replacement
                        inputRef.current.select();
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    autoComplete="off"
                    name={name} // Important for parent navigation to find it
                />
                <span className="input-group-text bg-white text-muted">
                    <ChevronDown size={14} />
                </span>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-sm overflow-auto"
                    style={{
                        zIndex: 1060,
                        maxHeight: '200px',
                        top: '100%',
                        borderRadius: '0 0 0.375rem 0.375rem',
                        marginTop: '-1px'
                    }}>
                    {filteredOptions.map((opt, index) => (
                        <li
                            key={opt.id}
                            className={`list-group-item list-group-item-action small py-2 px-3 ${index === highlightedIndex ? 'active' : ''}`}
                            onClick={() => handleSelect(opt)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            {opt.nombre || opt.label}
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && filteredOptions.length === 0 && (
                <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1060, top: '100%' }}>
                    <li className="list-group-item small text-muted fst-italic py-2">No hay resultados</li>
                </ul>
            )}
        </div>
    );
};

export default SearchableSelect;
