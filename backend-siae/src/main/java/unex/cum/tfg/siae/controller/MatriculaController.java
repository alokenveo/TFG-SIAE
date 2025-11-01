package unex.cum.tfg.siae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	public ResponseEntity<Page<Matricula>> obtenerMatriculas(@RequestParam(required = false) String search,
			@RequestParam(required = false) Long cursoId, @RequestParam(required = false) Integer anio,
			@PageableDefault(size = 20, sort = "alumno.apellidos") Pageable pageable) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		Long centroId = null;
		if (authentication != null
				&& authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTOR"))) {
			Object principal = authentication.getPrincipal();
			if (principal instanceof CustomUserDetails customUserDetails) {
				Usuario usuario = customUserDetails.getUsuario();
				if (usuario instanceof GestorInstitucional gestor) {
					centroId = gestor.getCentro().getId();
				}
			}
		}
		Page<Matricula> pagina = matriculaService.obtenerMatriculas(pageable, centroId, search, cursoId, anio);
		return ResponseEntity.ok(pagina);
	}

	@GetMapping("/alumno/{alumnoId}")
	public ResponseEntity<List<Matricula>> obtenerMatriculasPorAlumno(@PathVariable Long alumnoId) {
		List<Matricula> matriculas = matriculaService.obtenerMatriculasPorAlumno(alumnoId);
		return ResponseEntity.ok(matriculas);
	}

	@GetMapping("/anios")
	public ResponseEntity<List<Integer>> obtenerAnios() {
		List<Integer> anios = matriculaService.obtenerAnios();
		return ResponseEntity.ok(anios);
	}

}
