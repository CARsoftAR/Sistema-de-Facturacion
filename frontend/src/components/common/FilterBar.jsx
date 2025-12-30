import React from 'react';

const FilterBar = ({ children }) => {
    return (
        <div className="row g-3 mb-4">
            {children}
        </div>
    );
};

export default FilterBar;
