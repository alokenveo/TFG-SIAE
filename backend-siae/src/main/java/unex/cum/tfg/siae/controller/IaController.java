package unex.cum.tfg.siae.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.security.CustomUserDetails;
import unex.cum.tfg.siae.services.IaService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/ia")
public class IaController {

	@Autowired
	private IaService iaService;

	// Helper para obtener usuario/rol
	private Optional<CustomUserDetails> getUsuarioActual() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getPrincipal())) {
			return Optional.empty();
		}
		return Optional.of((CustomUserDetails) authentication.getPrincipal());
	}

	@GetMapping("/stats")
	public ResponseEntity<?> getIaStats(@RequestParam(required = false) Integer anio) {
		int anioAcademico = (anio != null) ? anio : LocalDate.now().getYear();

		try {
			Optional<CustomUserDetails> userDetailsOpt = getUsuarioActual();
			if (userDetailsOpt.isEmpty())
				return ResponseEntity.status(401).build();

			CustomUserDetails userDetails = userDetailsOpt.get();
			Usuario usuario = userDetails.getUsuario();

			if ("ADMIN".equals(usuario.getRol())) {
				Map<String, Object> statsProvincia = iaService.getPrediccionAgregada(anioAcademico, "provincia");

				Map<String, Object> statsCentro = iaService.getPrediccionAgregada(anioAcademico, "centro_educativo_id");
				if (statsCentro.containsKey("agregados")) {
					statsProvincia.put("agregadosPorCentro", statsCentro.get("agregados"));
				}
				if (statsCentro.containsKey("tendencias")) {
					statsProvincia.put("tendenciasPorCentro", statsCentro.get("tendencias"));
				}

				return ResponseEntity.ok(statsProvincia);

			} else if ("GESTOR".equals(usuario.getRol())) {
				GestorInstitucional gestor = (GestorInstitucional) usuario;
				Long centroId = gestor.getCentro().getId();
				List<Map<String, Object>> stats = iaService.getPrediccionAlumnosRiesgo(centroId, anioAcademico);
				return ResponseEntity.ok(stats);
			} else {
				return ResponseEntity.status(403).body(Map.of("error", "Sin permisos para análisis"));
			}
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
	}

	// Bonus: Endpoint para rendimiento por asignatura (llamado desde front si
	// quieres)
	@GetMapping("/rendimiento")
	public ResponseEntity<?> getRendimiento() {
		try {
			List<Map<String, Object>> rendimiento = iaService.getRendimientoPorAsignatura();
			return ResponseEntity.ok(rendimiento);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
	}
}