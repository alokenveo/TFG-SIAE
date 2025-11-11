import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import authService from '../api/authService';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Paper,
    Link,
    CircularProgress,
    CssBaseline
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Token no encontrado o inválido en la URL.');
            setTimeout(() => navigate('/login'), 3000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (!token) {
            setError('Falta el token de reseteo.');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.resetPassword(token, password);
            setMessage(
                response.message ||
                'Contraseña actualizada con éxito. Ya puedes iniciar sesión.'
            );
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Error al actualizar la contraseña. El token podría ser inválido o haber expirado.'
            );
            console.error('Error en reset password:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                        'linear-gradient(120deg, #004b85, #00579b, #00796b, #00897b)',
                    backgroundSize: '300% 300%',
                    animation: 'shiftGradient 12s ease infinite',
                    p: 2,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ width: '100%', maxWidth: 420 }}
                >
                    <Paper
                        elevation={10}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            backdropFilter: 'blur(12px)',
                            background: 'rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                            textAlign: 'center',
                        }}
                    >
                        <motion.img
                            src="/logo-siae.png"
                            alt="SIAE Logo"
                            style={{ width: 90, marginBottom: 20 }}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        />

                        <Typography
                            component="h1"
                            variant="h5"
                            sx={{ color: '#002f6c', fontWeight: 600, mb: 2 }}
                        >
                            Restablecer Contraseña
                        </Typography>

                        <AnimatePresence mode="wait">
                            {!message && token && (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            name="password"
                                            label="Nueva Contraseña"
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            name="confirmPassword"
                                            label="Confirmar Nueva Contraseña"
                                            type="password"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                            error={password !== confirmPassword && confirmPassword !== ''}
                                            helperText={
                                                password !== confirmPassword && confirmPassword !== ''
                                                    ? 'Las contraseñas no coinciden'
                                                    : ''
                                            }
                                        />

                                        {error && (
                                            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                                                {error}
                                            </Alert>
                                        )}

                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            disabled={loading}
                                            sx={{
                                                mt: 3,
                                                mb: 2,
                                                py: 1.3,
                                                fontWeight: 600,
                                                background: 'linear-gradient(90deg, #00579b, #00897b)',
                                                '&:hover': {
                                                    background: 'linear-gradient(90deg, #004b85, #00796b)',
                                                    transform: 'scale(1.02)',
                                                },
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={24} color="inherit" />
                                            ) : (
                                                'Cambiar Contraseña'
                                            )}
                                        </Button>
                                    </Box>
                                </motion.div>
                            )}

                            {message && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <CheckCircleOutlineIcon
                                        color="success"
                                        sx={{ fontSize: 60, mb: 2 }}
                                    />
                                    <Alert severity="success" sx={{ mb: 3 }}>
                                        {message}
                                    </Alert>
                                    <Link
                                        component={RouterLink}
                                        to="/login"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#00579b',
                                            textDecoration: 'none',
                                            '&:hover': { color: '#00897b' },
                                        }}
                                    >
                                        Ir a Iniciar Sesión
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Paper>
                </motion.div>
            </Box>

            <style>
                {`
                    @keyframes shiftGradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>
        </>
    );
}

export default ResetPassword;