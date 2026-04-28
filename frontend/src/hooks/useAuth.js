import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import store from '../store';
import {
    loginUser,
    registerUser,
    fetchCurrentUser,
    logoutUser,
    updateUserProfile,
} from '../store/authSlice';

// Set up axios defaults
axios.defaults.withCredentials = true;

// Axios interceptor: attach token from Redux store on every request
axios.interceptors.request.use((config) => {
    const { token } = store.getState().auth;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default function useAuth() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token, loading } = useSelector((state) => state.auth);

    const login = useCallback(async (payload) => {
        const result = await dispatch(loginUser(payload));
        if (loginUser.fulfilled.match(result)) {
            return result.payload;
        }
        const error = new Error(result.payload || 'Login failed');
        error.response = { data: { message: result.payload } };
        throw error;
    }, [dispatch]);

    const register = useCallback(async (payload) => {
        const result = await dispatch(registerUser(payload));
        if (registerUser.fulfilled.match(result)) {
            return result.payload;
        }
        const error = new Error(result.payload || 'Registration failed');
        error.response = { data: { message: result.payload } };
        throw error;
    }, [dispatch]);

    const logout = useCallback(async (skipNavigate = false) => {
        await dispatch(logoutUser());
        if (!skipNavigate) navigate('/');
    }, [dispatch, navigate]);

    const updateProfile = useCallback(async (formData) => {
        const result = await dispatch(updateUserProfile(formData));
        if (updateUserProfile.fulfilled.match(result)) {
            toast.success('Profile updated successfully');
            return result.payload;
        }
        toast.error(result.payload || 'Failed to update profile');
        throw new Error(result.payload);
    }, [dispatch]);

    const fetchUser = useCallback(async () => {
        const result = await dispatch(fetchCurrentUser());
        if (fetchCurrentUser.fulfilled.match(result)) {
            return result.payload.user;
        }
        return null;
    }, [dispatch]);

    const setUser = useCallback(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    const isVendor = user?.role === 'vendor';

    return { user, setUser, loading, isAuthenticated, isAdmin, isVendor, logout, login, register, updateProfile, fetchUser };
}

