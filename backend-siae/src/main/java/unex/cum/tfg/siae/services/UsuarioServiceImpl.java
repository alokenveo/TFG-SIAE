package unex.cum.tfg.siae.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unex.cum.tfg.siae.model.Administrador;
import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Invitado;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.model.dto.GestorDTO;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;
import unex.cum.tfg.siae.repository.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {

	private final UsuarioRepository usuarioRepository;
	private final CentroEducativoRepository centroRepo;
	private final PasswordEncoder passwordEncoder;

	public UsuarioServiceImpl(UsuarioRepository usuarioRepository, CentroEducativoRepository centroRepo,
			PasswordEncoder passwordEncoder) {
		this.usuarioRepository = usuarioRepository;
		this.centroRepo = centroRepo;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public boolean existeUsuario(Usuario usuario) {
		return usuarioRepository.existsByCorreo(usuario.getCorreo());
	}

	@Override
	public Usuario registrarGestor(GestorDTO dto) {
		if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
			throw new RuntimeException("El correo ya está registrado");
		}

		CentroEducativo centro = centroRepo.findById(dto.getCentroId())
				.orElseThrow(() -> new RuntimeException("Centro no encontrado"));

		GestorInstitucional gestor = new GestorInstitucional();
		gestor.setNombre(dto.getNombre());
		gestor.setCorreo(dto.getCorreo());
		gestor.setPassword(passwordEncoder.encode(dto.getPassword()));
		gestor.setCentro(centro);

		return usuarioRepository.save(gestor);
	}

	@Override
	public Usuario registrarAdministrador(Administrador admin) {
		if (usuarioRepository.existsByCorreo(admin.getCorreo())) {
			throw new RuntimeException("El correo ya está registrado");
		}
		Administrador ad = new Administrador();
		ad.setNombre(admin.getNombre());
		ad.setCorreo(admin.getCorreo());
		ad.setPassword(passwordEncoder.encode(admin.getPassword()));
		return usuarioRepository.save(ad);
	}

	@Override
	public Usuario registrarInvitador(Invitado invitado) {
		if (usuarioRepository.existsByCorreo(invitado.getCorreo())) {
			throw new RuntimeException("El correo ya está registrado");
		}
		Invitado inv = new Invitado();
		inv.setNombre(invitado.getNombre());
		inv.setCorreo(invitado.getCorreo());
		inv.setPassword(passwordEncoder.encode(invitado.getPassword()));
		return usuarioRepository.save(inv);
	}

	@Override
	public List<Usuario> obtenerUsuarios() {
		return usuarioRepository.findAll();
	}

	@Override
	public Usuario editarUsuario(Long id, Usuario usuarioDetails) {
		return usuarioRepository.findById(id).map(usuario -> {
			usuario.setNombre(usuarioDetails.getNombre());
			usuario.setCorreo(usuarioDetails.getCorreo());
			// Opcional: Lógica para cambiar la contraseña si se proporciona una nueva
			/*
			 * if (usuarioDetails.getPassword() != null &&
			 * !usuarioDetails.getPassword().isEmpty()) {
			 * usuario.setPassword(passwordEncoder.encode(usuarioDetails.getPassword())); }
			 */
			return usuarioRepository.save(usuario);
		}).orElse(null);
	}

	@Override
	public void eliminarUsuario(Long id) {
		if (!usuarioRepository.existsById(id)) {
			throw new RuntimeException("Usuario no encontrado con id: " + id);
		}
		usuarioRepository.deleteById(id);
	}

	@Override
	@Transactional
	public void generatePasswordResetToken(String correo) {
		Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);

		if (usuarioOpt.isPresent()) {
			Usuario usuario = usuarioOpt.get();
			String token = UUID.randomUUID().toString();
			LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);

			usuario.setResetToken(token);
			usuario.setResetTokenExpiry(expiryDate);
			usuarioRepository.save(usuario);

			// --- SIMULACIÓN ENVÍO EMAIL: Imprimir en consola ---
			String resetLink = "http://localhost:3000/reset-password?token=" + token;
			System.out.println("------------------------------------------------------------");
			System.out.println("SIMULACIÓN ENVÍO EMAIL para: " + correo);
			System.out.println("Token de reseteo: " + token);
			System.out.println("Enlace de reseteo (copiar y pegar en navegador): " + resetLink);
			System.out.println("Expira en: " + expiryDate);
			System.out.println("------------------------------------------------------------");
		} else {
			System.out.println("Solicitud de reseteo para correo no encontrado (o manejo silencioso): " + correo);
		}
	}

	@Override
	@Transactional
	public boolean resetPassword(String token, String nuevaPassword) {
		Optional<Usuario> usuarioOpt = usuarioRepository.findByResetToken(token);

		if (usuarioOpt.isPresent()) {
			Usuario usuario = usuarioOpt.get();

			if (usuario.getResetTokenExpiry() != null && usuario.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
				usuario.setPassword(passwordEncoder.encode(nuevaPassword));
				usuario.setResetToken(null);
				usuario.setResetTokenExpiry(null);
				usuarioRepository.save(usuario);
				return true;
			} else {
				usuario.setResetToken(null);
				usuario.setResetTokenExpiry(null);
				usuarioRepository.save(usuario);
				System.err.println("Intento de reseteo con token expirado o inválido: " + token);
			}
		} else {
			System.err.println("Intento de reseteo con token no encontrado: " + token);
		}
		return false;
	}

}
