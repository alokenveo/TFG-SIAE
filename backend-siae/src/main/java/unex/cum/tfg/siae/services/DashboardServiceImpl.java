package unex.cum.tfg.siae.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;
import unex.cum.tfg.siae.repository.MatriculaRepository;
import unex.cum.tfg.siae.repository.NotaRepository;
import unex.cum.tfg.siae.repository.PersonalRepository;
import unex.cum.tfg.siae.security.CustomUserDetails;

@Service
public class DashboardServiceImpl implements DashboardService {

	private final CentroEducativoRepository centroEducativoRepository;
	private final MatriculaRepository matriculaRepository;
	private final PersonalRepository personalRepository;
	private final NotaRepository notaRepository;

	@Value("${siae.ia-service.url}")
	private String iaServiceUrl;

	public DashboardServiceImpl(CentroEducativoRepository centroEducativoRepository,
			MatriculaRepository matriculaRepository, PersonalRepository personalRepository,
			NotaRepository notaRepository, RestTemplate restTemplate) {

		this.centroEducativoRepository = centroEducativoRepository;
		this.matriculaRepository = matriculaRepository;
		this.personalRepository = personalRepository;
		this.notaRepository = notaRepository;
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

		return stats;
	}

}
