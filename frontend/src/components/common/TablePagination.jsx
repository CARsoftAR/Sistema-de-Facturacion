import React, { useEffect, useState } from 'react';

const TablePagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    localStorageKey
}) => {

    // Local state for input to prevent focus loss during typing
    const [inputValue, setInputValue] = useState(itemsPerPage);

    // Sync local state when prop changes (e.g. initial load)
    useEffect(() => {
        setInputValue(itemsPerPage);
    }, [itemsPerPage]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const commitChange = () => {
        const val = parseInt(inputValue, 10);
        if (!isNaN(val) && val > 0) {
            if (val !== itemsPerPage) {
                onItemsPerPageChange(val);
                if (localStorageKey) {
                    localStorage.setItem(localStorageKey, val);
                }
            }
        } else {
            setInputValue(itemsPerPage); // Reset if invalid
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            commitChange();
            e.target.blur();
        }
    };

    if (totalItems === 0) return null;

    return (
        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
            <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Filas:</span>
                <input
                    type="number"
                    min="1"
                    className="form-control form-control-sm border-0 bg-transparent text-secondary fw-bold p-0 text-center"
                    style={{ width: '40px', cursor: 'pointer' }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={commitChange}
                    onKeyDown={handleKeyDown}
                />
                <span className="text-muted small ms-2">| Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}</span>
            </div>

            <nav>
                <ul className="pagination mb-0 align-items-center gap-2">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link border-0 text-secondary bg-transparent p-0"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            &lt;
                        </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => {
                        // Logic to truncate pages if too many
                        if (totalPages > 10 && Math.abs(currentPage - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) {
                            if (i === 1 || i === totalPages - 2) return <li key={i} className="page-item disabled"><span className="page-link border-0 bg-transparent text-secondary">...</span></li>;
                            return null;
                        }
                        return (
                            <li key={i} className="page-item">
                                <button
                                    className={`page-link border-0 rounded-circle fw-bold ${currentPage === i + 1 ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary'}`}
                                    onClick={() => onPageChange(i + 1)}
                                    style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        );
                    })}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link border-0 text-secondary bg-transparent p-0"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            &gt;
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default TablePagination;
