package unex.cum.tfg.siae.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.Autenticacion;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.repository.UsuarioRepository;

@Service
public class AutenticacionServiceImpl implements AutenticacionService {

	private final UsuarioRepository usuarioRepository;

	private final PasswordEncoder passwordEncoder;

	public AutenticacionServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public Usuario login(Autenticacion user) {
		Usuario usuario = usuarioRepository.findByCorreo(user.getCorreo()).orElse(null);

		if (usuario != null) {
			if (passwordEncoder.matches(usuario.getPassword(), user.getPassword())) {
				return usuario;
			}
		}

		return null;
	}

}
