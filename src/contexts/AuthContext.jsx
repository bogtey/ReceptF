import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('jwt'));
    const [userName, setUserName] = useState('');
    const [manId, setManId] = useState('');
    const [pseudonym, setPseudonym] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeUser  = async () => {
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setUserName(decodedToken.name || '');
                    setPseudonym(decodedToken.pseudonym || '');
                    setManId(decodedToken.id || '');
                    const response = await axiosInstance.get(`/admin/get/pseudonym/${decodedToken.id}`);
                    setPseudonym(response.data || '');
                } catch (error) {
                    console.error('Ошибка при получении данных пользователя:', error);
                }
            }
            setLoading(false);
        };

        initializeUser ();
    }, [token]);

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('jwt', newToken);
    };

    const logout = (navigate) => {
        setToken(null);
        setUserName('');
        setManId('');
        setPseudonym('');
        localStorage.removeItem('jwt');
        if (navigate) {
            navigate('/login');
        }
    };

    const checkTokenValidity = async () => {
        if (!token) {
            throw new Error('Token not found');
        }
        try {
            const response = await axiosInstance.get('/admin/check/token', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.status === 200;
        } catch (error) {
            console.error('Ошибка при проверке токена:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ token, userName, manId, pseudonym, loading, login, logout, checkTokenValidity }}>
            {children}
        </AuthContext.Provider>
    );
};