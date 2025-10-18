package unex.cum.tfg.siae.services;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.Asignatura;
import unex.cum.tfg.siae.model.Curso;
import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Nota;
import unex.cum.tfg.siae.model.NotaDTO;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.repository.AlumnoRepository;
import unex.cum.tfg.siae.repository.AsignaturaRepository;
import unex.cum.tfg.siae.repository.CursoRepository;
import unex.cum.tfg.siae.repository.NotaRepository;
import unex.cum.tfg.siae.security.CustomUserDetails;

@Service
public class NotaServiceImpl implements NotaService {

	// --- Repositorios ---
	private final AlumnoRepository alumnoRepo;
	private final AsignaturaRepository asignaturaRepo;
	private final CursoRepository cursoRepo;
	private final NotaRepository notaRepo;

	public NotaServiceImpl(AlumnoRepository alumnoRepo, AsignaturaRepository asignaturaRepo, CursoRepository cursoRepo,
			NotaRepository notaRepo) {
		this.alumnoRepo = alumnoRepo;
		this.asignaturaRepo = asignaturaRepo;
		this.cursoRepo = cursoRepo;
		this.notaRepo = notaRepo;
	}

	// --- MÉTODOS HELPER ---
	// Devuelve el ID del centro del gestor autenticado si existe
	private Optional<Long> getCentroIdGestorActual() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof CustomUserDetails customUser) {
			Usuario usuario = customUser.getUsuario();
			if (usuario instanceof GestorInstitucional gestor) {
				return Optional.ofNullable(gestor.getCentro().getId());
			}
		}
		return Optional.empty();
	}

	// Comprueba si el usuario actual es admin
	private boolean isAdminActual() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
	}

	// --- Registrar nota ---
	@Override
	public Nota registrarNota(NotaDTO dto) {
		// Validación: si es Gestor, solo puede registrar notas de alumnos de su centro
		Optional<Long> centroIdOpt = getCentroIdGestorActual();
		if (centroIdOpt.isPresent()) {
			Long centroIdGestor = centroIdOpt.get();

			Alumno alumno = alumnoRepo.findById(dto.getAlumnoId())
					.orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

			boolean perteneceAlCentro = alumno.getMatriculas() != null && alumno.getMatriculas().stream().anyMatch(
					m -> m.getCentroEducativo() != null && m.getCentroEducativo().getId().equals(centroIdGestor));

			if (!perteneceAlCentro) {
				throw new SecurityException(
						"Acceso denegado: No puedes registrar notas para alumnos de otros centros.");
			}
		}

		// Obtener entidades
		Alumno alumno = alumnoRepo.findById(dto.getAlumnoId())
				.orElseThrow(() -> new RuntimeException("Alumno no encontrado"));
		Asignatura asignatura = asignaturaRepo.findById(dto.getAsignaturaId())
				.orElseThrow(() -> new RuntimeException("Asignatura no encontrada"));
		Curso curso = cursoRepo.findById(dto.getCursoId())
				.orElseThrow(() -> new RuntimeException("Curso no encontrado"));

		Nota nota = new Nota();
		nota.setAlumno(alumno);
		nota.setAsignatura(asignatura);
		nota.setCurso(curso);
		nota.setAnioAcademico(dto.getAnioAcademico());
		nota.setCalificacion(dto.getCalificacion());

		return notaRepo.save(nota);
	}

	// --- Listar todas las notas (filtrado por rol) ---
	@Override
	public List<Nota> obtenerNotas() {
		Optional<Long> centroIdOpt = getCentroIdGestorActual();

		if (centroIdOpt.isPresent()) {
			// Gestor: solo notas de su centro
			Long centroId = centroIdOpt.get();
			return notaRepo.findAll().stream().filter(n -> n.getAlumno().getMatriculas().stream()
					.anyMatch(m -> m.getCentroEducativo().getId().equals(centroId))).toList();
		} else if (isAdminActual()) {
			return notaRepo.findAll();
		}
		return List.of(); // usuario sin permisos
	}

	// --- Listar notas por alumno (filtrado por rol) ---
	@Override
	public List<Nota> obtenerNotasPorAlumno(Long alumnoId) {
		Optional<Long> centroIdOpt = getCentroIdGestorActual();

		if (centroIdOpt.isPresent()) {
			Long centroId = centroIdOpt.get();
			Alumno alumno = alumnoRepo.findById(alumnoId)
					.orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

			boolean perteneceAlCentro = alumno.getMatriculas().stream()
					.anyMatch(m -> m.getCentroEducativo().getId().equals(centroId));

			if (!perteneceAlCentro) {
				throw new SecurityException("Acceso denegado: No puedes ver notas de alumnos de otros centros.");
			}

			return notaRepo.findByAlumnoId(alumnoId);

		} else if (isAdminActual()) {
			return notaRepo.findByAlumnoId(alumnoId);
		}

		return List.of();
	}
}
