package unex.cum.tfg.siae.controller;

import java.time.LocalDate;
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
import unex.cum.tfg.siae.services.DashboardService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/dashboard")
public class DashboardController {

	@Autowired
	private DashboardService dashboardService;

	// Helper para obtener el usuario/rol actual
	private Optional<CustomUserDetails> getUsuarioActual() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getPrincipal())) {
			return Optional.empty();
		}
		return Optional.of((CustomUserDetails) authentication.getPrincipal());
	}

	@GetMapping("/")
	public ResponseEntity<?> getDashboardStats(@RequestParam(required = false) Integer anio) {

		// Año académico actual por defecto
		int anioAcademico = (anio != null) ? anio : LocalDate.now().getYear();

		try {
			Optional<CustomUserDetails> userDetailsOpt = getUsuarioActual();
			if (userDetailsOpt.isEmpty())
				return ResponseEntity.status(401).build();

			CustomUserDetails userDetails = userDetailsOpt.get();
			Usuario usuario = userDetails.getUsuario();
			Map<String, Object> stats;

			if ("ADMIN".equals(usuario.getRol())) {
				stats = dashboardService.getAdminDashboardStats(anioAcademico);
			} else if ("GESTOR".equals(usuario.getRol())) {
				GestorInstitucional gestor = (GestorInstitucional) usuario;
				Long centroId = gestor.getCentro().getId();
				stats = dashboardService.getGestorDashboardStats(centroId, anioAcademico);
			} else {
				stats = Map.of("message", "Bienvenido, Invitado.");
			}
			return ResponseEntity.ok(stats);
		} catch (SecurityException e) {
			return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
	}

}
