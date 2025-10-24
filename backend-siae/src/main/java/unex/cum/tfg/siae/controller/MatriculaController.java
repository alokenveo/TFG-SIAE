package unex.cum.tfg.siae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.model.dto.MatriculaDTO;
import unex.cum.tfg.siae.security.CustomUserDetails;
import unex.cum.tfg.siae.services.MatriculaService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/matriculas")
public class MatriculaController {

	@Autowired
	private MatriculaService matriculaService;

	@PostMapping("/registrar")
	public ResponseEntity<Matricula> registrarMatricula(@RequestBody MatriculaDTO dto) {
		Matricula matricula = matriculaService.registrarMatricula(dto);
		return ResponseEntity.ok(matricula);
	}

	@GetMapping("/lista")
	public ResponseEntity<List<Matricula>> obtenerMatriculas() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		List<Matricula> matriculas = null;
		if (authentication != null
				&& authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTOR"))) {
			Object principal = authentication.getPrincipal();
	        if (principal instanceof CustomUserDetails customUserDetails) {
	            Usuario usuario = customUserDetails.getUsuario();
	            if (usuario instanceof GestorInstitucional gestor) {
	                Long centroId = gestor.getCentro().getId();
	                matriculas = matriculaService.obtenerMatriculasPorCentro(centroId);
	            }
	        }
		} else {
			matriculas = matriculaService.obtenerMatriculas();
		}
		return ResponseEntity.ok(matriculas);
	}

}
