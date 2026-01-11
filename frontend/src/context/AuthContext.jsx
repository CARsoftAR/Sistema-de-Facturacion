import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/mi-perfil/info/');
            if (response.ok) {
                const data = await response.json();
                if (data.ok) {
                    setUser(data.data);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.is_staff) return true;
        return user.permisos?.[permission] || false;
    };

    return (
        <AuthContext.Provider value={{ user, loading, hasPermission, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
