import React from 'react';

const PageHeader = ({ title, subtitle, icon: Icon, children }) => {
    return (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="text-primary fw-bold mb-0 d-flex align-items-center" style={{ fontSize: '2.2rem' }}>
                        {Icon && <Icon className="me-2" style={{ fontSize: '0.8em' }} />}
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: '1.1rem' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
