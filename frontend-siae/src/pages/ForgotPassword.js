import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ForgotPassword() {
    const [correo, setCorreo] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await authService.requestPasswordReset(correo);
            setMessage(
                response.message ||
                'Solicitud procesada. Si tu correo está registrado, recibirás instrucciones.'
            );
        } catch (err) {
            setError('Error al procesar la solicitud. Inténtalo de nuevo más tarde.');
            console.error('Error en forgot password:', err);
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
                    background: 'linear-gradient(120deg, #e3f2fd, #f1f8f6)',
                    backgroundSize: '200% 200%',
                    animation: 'softGradient 10s ease infinite',
                    p: 2,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ width: '100%', maxWidth: 420 }}
                >
                    <Paper
                        elevation={6}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            backdropFilter: 'blur(10px)',
                            background: 'rgba(255,255,255,0.85)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                        }}
                    >
                        <motion.img
                            src="/logo-siae.png"
                            alt="SIAE Logo"
                            style={{ width: 90, marginBottom: 16 }}
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        />

                        <Typography
                            component="h1"
                            variant="h5"
                            sx={{ color: '#00579b', fontWeight: 600, mb: 1 }}
                        >
                            Recuperar Contraseña
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                            Introduce tu correo electrónico y te enviaremos un enlace para
                            restablecerla.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="correo"
                                label="Correo Electrónico"
                                name="correo"
                                autoComplete="email"
                                autoFocus
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                disabled={loading || !!message}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            {message && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    {message}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading || !!message}
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
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar enlace'}
                            </Button>

                            <Link
                                component={RouterLink}
                                to="/login"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: '#00579b',
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease',
                                    '&:hover': { color: '#00897b' },
                                }}
                            >
                                <ArrowBackIcon fontSize="small" /> Volver a Iniciar Sesión
                            </Link>
                        </Box>
                    </Paper>
                </motion.div>
            </Box>

            <style>
                {`
                    @keyframes softGradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>
        </>
    );
}

export default ForgotPassword;