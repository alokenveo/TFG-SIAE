package unex.cum.tfg.siae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.security.CustomUserDetails;
import unex.cum.tfg.siae.services.CentroEducativoService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/centros")
public class CentroEducativoController {

	@Autowired
	private CentroEducativoService centroEducativoService;

	@GetMapping("/lista")
	public ResponseEntity<List<CentroEducativo>> obtenerTodosLosCentros() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		List<CentroEducativo> centros = null;
		if (authentication != null
				&& authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTOR"))) {
			Object principal = authentication.getPrincipal();
			if (principal instanceof CustomUserDetails) {
				Usuario usuario = ((CustomUserDetails) principal).getUsuario();
				if (usuario instanceof GestorInstitucional gestor) {
					centros.add(gestor.getCentro());
				}
			}
		} else {
			centros = centroEducativoService.obtenerTodosLosCentros();
		}

		if (centros.isEmpty()) {
			return ResponseEntity.noContent().build();
		}

		return ResponseEntity.ok(centros);
	}

	@PostMapping("/registrar")
	public ResponseEntity<CentroEducativo> registrarCentro(@RequestBody CentroEducativo centro) {
		CentroEducativo nuevoCentro = centroEducativoService.registrarCentroEducativo(centro);
		return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCentro);
	}

	@PutMapping("/editar/{id}")
	public ResponseEntity<CentroEducativo> editarCentro(@PathVariable Long id, @RequestBody CentroEducativo centro) {
		CentroEducativo centroActualizado = centroEducativoService.editarCentroEducativo(id, centro);
		if (centroActualizado == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(centroActualizado);
	}

	@DeleteMapping("/eliminar/{id}")
	public ResponseEntity<Void> eliminarCentro(@PathVariable Long id) {
		centroEducativoService.eliminarCentroEducativo(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/provincia/{provincia}")
	public ResponseEntity<List<CentroEducativo>> obtenerCentrosPorProvincia(@PathVariable String provincia) {
		List<CentroEducativo> centros = centroEducativoService.obtenerCentrosPorProvincia(provincia);
		if (centros == null || centros.isEmpty()) {
			return ResponseEntity.noContent().build();
		}

		return ResponseEntity.ok(centros);
	}

}
