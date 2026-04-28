import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, payload, { withCredentials: true });
            if (data.success) return data;
            return rejectWithValue(data.message || 'Login failed');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/register`, payload, { withCredentials: true });
            if (data.success) return data;
            return rejectWithValue(data.message || 'Registration failed');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchMe',
    async (_, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const config = { withCredentials: true };
            if (token) {
                config.headers = { Authorization: `Bearer ${token}` };
            }
            const { data } = await axios.get(`${API_URL}/auth/me`, config);
            if (data.success) return data;
            return rejectWithValue('Failed to fetch user');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Session expired');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { getState }) => {
        const { token } = getState().auth;
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
        } catch { /* ignore */ }
        return null;
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async (formData, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const { data } = await axios.put(`${API_URL}/auth/profile`, formData, {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (data.success) return data;
            return rejectWithValue(data.message || 'Update failed');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        loading: true,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Fetch current user
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.loading = false;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.loading = false;
            });

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.loading = false;
            });

        // Update profile
        builder
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.user = action.payload.user;
            });
    },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
