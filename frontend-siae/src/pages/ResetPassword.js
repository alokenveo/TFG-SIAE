import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import authService from '../api/authService';
import {
    Container, Box, TextField, Button, Typography, Alert, Paper, Link, CircularProgress
} from '@mui/material';

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
            navigate('/login');
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
            setMessage(response.message || 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar la contraseña. El token podría ser inválido o haber expirado.');
            console.error('Error en reset password:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Restablecer Contraseña
                </Typography>

                {token && !message && (
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal" required fullWidth name="password" label="Nueva Contraseña"
                            type="password" id="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal" required fullWidth name="confirmPassword" label="Confirmar Nueva Contraseña"
                            type="password" id="confirmPassword"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            error={password !== confirmPassword && confirmPassword !== ''}
                            helperText={password !== confirmPassword && confirmPassword !== '' ? 'Las contraseñas no coinciden' : ''}
                        />

                        {error && (
                            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>
                        )}

                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Cambiar Contraseña'}
                        </Button>
                    </Box>
                )}

                {message && (
                    <Box sx={{ mt: 2, width: '100%' }}>
                        <Alert severity="success">{message}</Alert>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Link component={RouterLink} to="/login" variant="body2">
                                Ir a Iniciar Sesión
                            </Link>
                        </Box>
                    </Box>
                )}
                {!token && error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>
                )}

            </Paper>
        </Container>
    );
}

export default ResetPassword;