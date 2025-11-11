import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../api/authService';
import { Box, TextField, Button, Typography, Alert, Grid, CssBaseline, Paper } from '@mui/material';
import { motion } from 'framer-motion';

function Login() {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await authService.login(correo, password);
            login(data.token, data.usuario);
            navigate('/');
        } catch (err) {
            setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
            console.error('Error de login:', err);
        }
    };

    return (
        <>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    height: '100vh',
                    width: '100vw',
                    overflow: 'hidden',
                }}
            >
                {/* Sección Izquierda: Gradiente Animado */}
                <Box
                    sx={{
                        flex: 1,
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        background: 'linear-gradient(120deg, #00579b, #00897b, #4a83bc)',
                        backgroundSize: '200% 200%',
                        animation: 'gradientShift 10s ease infinite',
                        position: 'relative',
                    }}
                >
                    {/* Fondo con patrón sutil */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            opacity: 0.3,
                        }}
                    />
                    {/* Contenido animado */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        style={{ textAlign: 'center', zIndex: 1, maxWidth: '60%' }}
                    >
                        <motion.img
                            src="/logo-siae.png"
                            alt="SIAE Logo"
                            style={{ width: 160, marginBottom: 24 }}
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Bienvenido a SIAE
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', opacity: 0.9 }}>
                            El sistema inteligente para la gestión educativa moderna.
                        </Typography>
                    </motion.div>
                </Box>

                {/* Sección Derecha: Login Form */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f9fafc',
                        px: 3,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ width: '100%', maxWidth: 400 }}
                    >
                        <Paper
                            elevation={8}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                backdropFilter: 'blur(8px)',
                                backgroundColor: 'rgba(255,255,255,0.85)',
                            }}
                        >
                            <Typography
                                component="h1"
                                variant="h5"
                                sx={{ color: '#002f6c', mb: 3, fontWeight: 600, textAlign: 'center' }}
                            >
                                Iniciar Sesión
                            </Typography>

                            <Box component="form" noValidate onSubmit={handleSubmit}>
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
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Contraseña"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                    sx={{
                                        mt: 3,
                                        mb: 2,
                                        py: 1.4,
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        background: 'linear-gradient(90deg, #00579b, #00897b)',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            background: 'linear-gradient(90deg, #004b85, #00796b)',
                                            transform: 'scale(1.02)',
                                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                        },
                                    }}
                                >
                                    Entrar
                                </Button>

                                <Grid container justifyContent="flex-end">
                                    <Grid item>
                                        <Link to="/forgot-password" style={{ color: '#00897b', textDecoration: 'none' }}>
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </motion.div>
                </Box>
            </Box>

            {/* Animación global */}
            <style>
                {`
                    @keyframes gradientShift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>
        </>
    );
}

export default Login;