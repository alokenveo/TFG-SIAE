package unex.cum.tfg.siae.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
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

		admin.setPassword(passwordEncoder.encode(admin.getPassword()));
		return usuarioRepository.save(admin);
	}

	@Override
	public Usuario registrarInvitador(Invitado invitado) {
		if (usuarioRepository.existsByCorreo(invitado.getCorreo())) {
			throw new RuntimeException("El correo ya está registrado");
		}

		invitado.setPassword(passwordEncoder.encode(invitado.getPassword()));
		return usuarioRepository.save(invitado);
	}

	@Override
	public Page<Usuario> obtenerUsuarios(Pageable pageable, String search, String rol) {

		Specification<Usuario> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (search != null && !search.isEmpty()) {
				String searchLower = "%" + search.toLowerCase() + "%";
				Predicate nombrePred = cb.like(cb.lower(root.get("nombre")), searchLower);
				Predicate correoPred = cb.like(cb.lower(root.get("correo")), searchLower);
				predicates.add(cb.or(nombrePred, correoPred));
			}

			if (rol != null && !rol.isEmpty() && !"TODOS".equals(rol)) {
				switch (rol.toUpperCase()) {
					case "ADMIN":
						predicates.add(cb.equal(root.type(), Administrador.class));
						break;
					case "GESTOR":
						predicates.add(cb.equal(root.type(), GestorInstitucional.class));
						break;
					case "INVITADO":
						predicates.add(cb.equal(root.type(), Invitado.class));
						break;
					default:
						// No agregar nada si rol inválido
				}
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		if (pageable.getSort().isUnsorted()) {
			pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
					Sort.by("nombre").ascending());
		}

		return usuarioRepository.findAll(spec, pageable);
	}

	@Override
	public Usuario editarUsuario(Long id, Usuario usuarioDetails) {
		return usuarioRepository.findById(id).map(usuario -> {
			usuario.setNombre(usuarioDetails.getNombre());
			usuario.setCorreo(usuarioDetails.getCorreo());

			if (usuarioDetails.getPassword() != null && !usuarioDetails.getPassword().isEmpty()) {
				usuario.setPassword(passwordEncoder.encode(usuarioDetails.getPassword()));
			}

			if (usuario instanceof GestorInstitucional && usuarioDetails instanceof GestorInstitucional) {
				((GestorInstitucional) usuario).setCentro(((GestorInstitucional) usuarioDetails).getCentro());
			}

			return usuarioRepository.save(usuario);
		}).orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
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
