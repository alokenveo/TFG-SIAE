import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../api/authService';
import { Container, Box, TextField, Button, Typography, Alert, Paper, Grid } from '@mui/material';

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
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="/logo-siae.png" alt="SIAE Logo" style={{ width: 100, marginBottom: 16 }} />
                <Typography component="h1" variant="h5">
                    Iniciar Sesión
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Entrar
                    </Button>

                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link to="/forgot-password" variant="body2">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;