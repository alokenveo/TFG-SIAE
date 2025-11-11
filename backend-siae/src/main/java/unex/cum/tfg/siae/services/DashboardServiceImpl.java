package unex.cum.tfg.siae.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public DashboardServiceImpl(
            CentroEducativoRepository centroEducativoRepository,
            MatriculaRepository matriculaRepository,
            PersonalRepository personalRepository,
            NotaRepository notaRepository) {

        this.centroEducativoRepository = centroEducativoRepository;
        this.matriculaRepository = matriculaRepository;
        this.personalRepository = personalRepository;
        this.notaRepository = notaRepository;
    }

    // ======================
    // === ADMIN STATS ===
    // ======================
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAdminDashboardStats(int anioAcademico) {
        if (!isAdminActual())
            throw new SecurityException("Acceso denegado");

        Map<String, Object> stats = new HashMap<>();

        // 1️⃣ KPIs generales
        stats.put("totalAlumnos", matriculaRepository.countByAnioAcademico(anioAcademico));
        stats.put("totalCentros", centroEducativoRepository.count());
        stats.put("totalPersonal", personalRepository.count());

        // 2️⃣ Gráficos descriptivos
        stats.put("alumnosPorProvincia", matriculaRepository.countAlumnosByProvincia(anioAcademico));
        stats.put("rendimientoNacionalPorEvaluacion", notaRepository.findAverageNacionalByEvaluacion(anioAcademico));
        stats.put("distribucionNotasNacional", notaRepository.findGradeDistributionNacional(anioAcademico));
        stats.put("rendimientoPorAsignatura", notaRepository.findAverageByAsignaturaNacional(anioAcademico));

        // 3️⃣ Enriquecimientos adicionales
        stats.put("alumnosPorNivelNacional", matriculaRepository.countAlumnosByNivelNacional(anioAcademico));
        stats.put("centrosPorTipo", centroEducativoRepository.countCentrosByTipo());

        return stats;
    }

    // ======================
    // === GESTOR STATS ===
    // ======================
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getGestorDashboardStats(Long centroId, int anioAcademico) {
        Optional<Long> gestorCentroId = getCentroIdGestorActual();
        if (gestorCentroId.isEmpty() || !gestorCentroId.get().equals(centroId)) {
            throw new SecurityException("Acceso denegado a estadísticas de este centro.");
        }

        Map<String, Object> stats = new HashMap<>();

        // 1️⃣ KPIs del centro
        stats.put("totalAlumnosCentro",
                matriculaRepository.countByCentroEducativoIdAndAnioAcademico(centroId, anioAcademico));
        stats.put("totalPersonalCentro", personalRepository.countByCentroEducativoId(centroId));

        // 2️⃣ Gráficos del centro
        stats.put("rendimientoCentroPorEvaluacion",
                notaRepository.findAverageByCentroIdAndEvaluacion(centroId, anioAcademico));
        stats.put("rendimientoNacionalPorEvaluacion",
                notaRepository.findAverageNacionalByEvaluacion(anioAcademico));
        stats.put("alumnosPorNivel", matriculaRepository.countAlumnosByNivelCentro(centroId, anioAcademico));

        // 3️⃣ Enriquecimientos adicionales
        stats.put("distribucionNotasCentro", notaRepository.findGradeDistributionCentro(centroId, anioAcademico));
        stats.put("rendimientoPorAsignaturaCentro",
                notaRepository.findAverageByAsignaturaCentro(centroId, anioAcademico));

        return stats;
    }

    // ======================
    // === MÉTODOS PRIVADOS ===
    // ======================
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

    private boolean isAdminActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
