import React from 'react';

const DataCard = ({ children }) => {
    return (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="card-body p-0">
                <div className="table-responsive">
                    {children}
                </div>
            </div>
            <style>
                {`
                .table-header-gray {
                    background-color: #f9fafb !important;
                }
                .text-header-small {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #666;
                    text-transform: uppercase;
                }
                `}
            </style>
        </div>
    );
};

export default DataCard;
