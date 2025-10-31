package unex.cum.tfg.siae.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.model.Nota;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.model.dto.AggregationRequestDTO;
import unex.cum.tfg.siae.model.dto.AlumnoEnRiesgoDTO;
import unex.cum.tfg.siae.model.dto.AlumnoEnRiesgoResponseDTO;
import unex.cum.tfg.siae.model.dto.AlumnoInputAgregadoDTO;
import unex.cum.tfg.siae.model.dto.AlumnoInputDTO;
import unex.cum.tfg.siae.model.dto.PredictionRequestDTO;
import unex.cum.tfg.siae.model.dto.RiesgoProvinciaResponseDTO;
import unex.cum.tfg.siae.repository.AlumnoRepository;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;
import unex.cum.tfg.siae.repository.MatriculaRepository;
import unex.cum.tfg.siae.repository.NotaRepository;
import unex.cum.tfg.siae.repository.PersonalRepository;
import unex.cum.tfg.siae.security.CustomUserDetails;

@Service
public class DashboardServiceImpl implements DashboardService {

	private final AlumnoRepository alumnoRepository;
	private final CentroEducativoRepository centroEducativoRepository;
	private final MatriculaRepository matriculaRepository;
	private final PersonalRepository personalRepository;
	private final NotaRepository notaRepository;

	private final RestTemplate restTemplate;

	@Value("${siae.ia-service.url}")
	private String iaServiceUrl;

	private static final String EVALUACION_REFERENCIA = "1ª Evaluación";

	public DashboardServiceImpl(AlumnoRepository alumnoRepository, CentroEducativoRepository centroEducativoRepository,
			MatriculaRepository matriculaRepository, PersonalRepository personalRepository,
			NotaRepository notaRepository, RestTemplate restTemplate) {

		this.alumnoRepository = alumnoRepository;
		this.centroEducativoRepository = centroEducativoRepository;
		this.matriculaRepository = matriculaRepository;
		this.personalRepository = personalRepository;
		this.notaRepository = notaRepository;
		this.restTemplate = restTemplate;
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

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getAdminDashboardStats(int anioAcademico) {
		if (!isAdminActual())
			throw new SecurityException("Acceso denegado");
		Map<String, Object> stats = new HashMap<>();

		// --- 1. KPIs Descriptivos ---
		stats.put("totalAlumnos", matriculaRepository.countByAnioAcademico(anioAcademico));
		stats.put("totalCentros", centroEducativoRepository.count());
		stats.put("totalPersonal", personalRepository.count());

		// --- 2. Gráficos Descriptivos ---
		stats.put("alumnosPorProvincia", matriculaRepository.countAlumnosByProvincia(anioAcademico));
		stats.put("rendimientoNacionalPorEvaluacion", notaRepository.findAverageNacionalByEvaluacion(anioAcademico));
		stats.put("distribucionNotasNacional", notaRepository.findGradeDistributionNacional(anioAcademico));
		stats.put("rendimientoPorAsignatura", notaRepository.findAverageByAsignaturaNacional(anioAcademico));

		// --- 3. Estadísticas Predictivas (Llamada a IA) ---
		stats.put("riesgoPorProvincia", getPrediccionAgregada(anioAcademico));

		return stats;
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getGestorDashboardStats(Long centroId, int anioAcademico) {
		Optional<Long> gestorCentroId = getCentroIdGestorActual();
		if (gestorCentroId.isEmpty() || !gestorCentroId.get().equals(centroId)) {
			throw new SecurityException("Acceso denegado a estadísticas de este centro.");
		}

		Map<String, Object> stats = new HashMap<>();

		// --- 1. KPIs Descriptivos (Centro) ---
		stats.put("totalAlumnosCentro",
				matriculaRepository.countByCentroEducativoIdAndAnioAcademico(centroId, anioAcademico));
		stats.put("totalPersonalCentro", personalRepository.countByCentroEducativoId(centroId));

		// --- 2. Gráficos Descriptivos (Centro) ---
		stats.put("rendimientoCentroPorEvaluacion",
				notaRepository.findAverageByCentroIdAndEvaluacion(centroId, anioAcademico));
		stats.put("rendimientoNacionalPorEvaluacion", notaRepository.findAverageNacionalByEvaluacion(anioAcademico));
		stats.put("alumnosPorNivel", matriculaRepository.countAlumnosByNivelCentro(centroId, anioAcademico));

		// --- 3. Estadísticas Predictivas (Llamada a IA) ---
		stats.put("alumnosEnRiesgo", getPrediccionAlumnosRiesgo(centroId, anioAcademico, EVALUACION_REFERENCIA));

		return stats;
	}

	/**
	 * Llama a la IA para obtener la lista de alumnos en riesgo de UN CENTRO. (Este
	 * es el método que ya teníamos, pero extraído)
	 */
	private List<AlumnoEnRiesgoDTO> getPrediccionAlumnosRiesgo(Long centroId, int anioAcademico, String evaluacion) {
		List<Matricula> matriculas = matriculaRepository.findByCentroEducativoIdAndAnioAcademico(centroId,
				anioAcademico);

		List<AlumnoInputDTO> alumnosInput = matriculas.stream().map(matricula -> {
			List<Nota> notas = notaRepository.findByAlumnoIdAndAnioAcademicoAndEvaluacion(matricula.getAlumno().getId(),
					anioAcademico, evaluacion);

			return new AlumnoInputDTO(matricula.getAlumno().getId(), matricula.getAlumno().getFechaNacimiento(),
					matricula.getCurso().getOrden(), matricula.getCurso().getNivel().getId(),
					notas.stream().map(Nota::getCalificacion).collect(Collectors.toList()));
		}).collect(Collectors.toList());

		PredictionRequestDTO requestBody = new PredictionRequestDTO(alumnosInput);
		List<AlumnoEnRiesgoDTO> alumnosEnRiesgo = new ArrayList<>();

		try {
			String url = iaServiceUrl + "/predict";
			ResponseEntity<AlumnoEnRiesgoResponseDTO[]> response = restTemplate.postForEntity(url, requestBody,
					AlumnoEnRiesgoResponseDTO[].class);

			if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				// "Re-hidratar" la respuesta
				Arrays.asList(response.getBody())
						.forEach(prediccion -> alumnoRepository.findById(prediccion.alumno_id())
								.ifPresent(alumno -> alumnosEnRiesgo.add(new AlumnoEnRiesgoDTO(alumno,
										prediccion.probabilidad_riesgo(), prediccion.motivo_principal()))));
			}
		} catch (Exception e) {
			System.err.println("Error al contactar el servicio de IA (/predict): " + e.getMessage());
		}
		return alumnosEnRiesgo;
	}

	/**
	 * NUEVO: Llama a la IA para obtener el riesgo agregado por provincia.
	 */
	private List<RiesgoProvinciaResponseDTO> getPrediccionAgregada(int anioAcademico) {
		// Obtenemos TODAS las matrículas del año
		List<Matricula> todasLasMatriculas = matriculaRepository.findByAnioAcademico(anioAcademico);

		// Preparamos la lista de DTOs para la IA
		List<AlumnoInputAgregadoDTO> alumnosInput = todasLasMatriculas.stream().map(matricula -> {
			List<Nota> notas = notaRepository.findByAlumnoIdAndAnioAcademicoAndEvaluacion(matricula.getAlumno().getId(),
					anioAcademico, EVALUACION_REFERENCIA);

			return new AlumnoInputAgregadoDTO(matricula.getAlumno().getId(), matricula.getAlumno().getFechaNacimiento(),
					matricula.getCurso().getOrden(), matricula.getCurso().getNivel().getId(),
					notas.stream().map(Nota::getCalificacion).collect(Collectors.toList()),
					matricula.getCentroEducativo().getProvincia().name()
			);
		}).collect(Collectors.toList());

		AggregationRequestDTO requestBody = new AggregationRequestDTO(alumnosInput);

		try {
			String url = iaServiceUrl + "/predict/aggregation";
			ResponseEntity<RiesgoProvinciaResponseDTO[]> response = restTemplate.postForEntity(url, requestBody,
					RiesgoProvinciaResponseDTO[].class);

			if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				return Arrays.asList(response.getBody());
			}

		} catch (Exception e) {
			System.err.println("Error al contactar el servicio de IA (/predict/aggregation): " + e.getMessage());
		}
		return new ArrayList<>(); // Devolver lista vacía en caso de error
	}
}
