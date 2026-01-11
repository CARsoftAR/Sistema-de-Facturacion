import React from 'react';
import { ShoppingCart } from 'lucide-react';

const EmptyState = ({
    icon: Icon = ShoppingCart,
    title = "No hay datos",
    description = "No se encontraron registros para mostrar.",
    iconColor = "text-blue-500",
    bgIconColor = "bg-blue-50"
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 transition-all animate-in fade-in duration-500">
            <div className={`w-24 h-24 rounded-full ${bgIconColor} flex items-center justify-center mb-6 shadow-sm`}>
                <Icon size={40} className={`opacity-80 ${iconColor}`} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2 text-center">{title}</h3>
            <p className="text-slate-400 text-center max-w-sm font-medium">
                {description}
            </p>
        </div>
    );
};

export default EmptyState;
