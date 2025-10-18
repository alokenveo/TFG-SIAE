import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    // 1. LEEMOS EL ESTADO INICIAL DESDE LOCALSTORAGE
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [usuario, setUsuario] = useState(() => {
        const storedUser = localStorage.getItem('usuario');
        try {
            // Intentamos parsear el JSON
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error al parsear usuario de localStorage", error);
            localStorage.removeItem('usuario'); // Limpiamos si está corrupto
            return null;
        }
    });

    const login = (token, user) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('usuario', JSON.stringify(user)); // Guardamos como JSON
        setAuthToken(token);
        setUsuario(user);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        setAuthToken(null);
        setUsuario(null);
    };

    const value = {
        authToken,
        usuario,
        login,
        logout,
        isAuthenticated: !!authToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}