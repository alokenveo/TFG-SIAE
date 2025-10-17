package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.Administrador;
import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.GestorDTO;
import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Invitado;
import unex.cum.tfg.siae.model.Usuario;
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
			if (usuarioDetails.getPassword() != null && !usuarioDetails.getPassword().isEmpty()) {
				usuario.setPassword(passwordEncoder.encode(usuarioDetails.getPassword()));
			}
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

}
