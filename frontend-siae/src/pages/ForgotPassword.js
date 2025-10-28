import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../api/authService';
import {
    Container, Box, TextField, Button, Typography, Alert, Paper, Link, CircularProgress
} from '@mui/material';

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
            setMessage(response.message || "Solicitud procesada. Si tu correo está registrado, recibirás instrucciones.");
        } catch (err) {
            setError('Error al procesar la solicitud. Inténtalo de nuevo más tarde.');
            console.error('Error en forgot password:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Recuperar Contraseña
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
                    Introduce tu correo electrónico y te enviaremos (simularemos) un enlace para restablecer tu contraseña.
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal" required fullWidth id="correo" label="Correo Electrónico"
                        name="correo" autoComplete="email" autoFocus
                        value={correo} onChange={(e) => setCorreo(e.target.value)}
                        disabled={loading || !!message}
                    />

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {message && (
                        <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
                            {message}
                        </Alert>
                    )}

                    <Button
                        type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                        disabled={loading || !!message}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Solicitar Reseteo'}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                         <Link component={RouterLink} to="/login" variant="body2">
                            Volver a Iniciar Sesión
                         </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default ForgotPassword;