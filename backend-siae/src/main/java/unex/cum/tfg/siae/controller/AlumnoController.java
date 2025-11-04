package unex.cum.tfg.siae.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.model.dto.AlumnoDetalleDTO;
import unex.cum.tfg.siae.security.CustomUserDetails;
import unex.cum.tfg.siae.services.AlumnoService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/alumnos")
public class AlumnoController {

	@Autowired
	private AlumnoService alumnoService;

	@PostMapping("/registrar")
	public ResponseEntity<Alumno> registrarAlumno(@RequestBody Alumno alumno) {
		Alumno nuevoAlumno = alumnoService.registarAlumno(alumno);
		return ResponseEntity.status(HttpStatus.CREATED).body(nuevoAlumno);
	}

	@GetMapping("/lista")
	public ResponseEntity<Page<Alumno>> obtenerAlumnos(@RequestParam(required = false) String search,
			@RequestParam(required = false) String sexo, @RequestParam(required = false) Integer anioInicio,
			@RequestParam(required = false) Integer anioFin,
			@PageableDefault(size = 20, sort = "apellidos") Pageable pageable) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		Long centroId = null;

		if (authentication != null
				&& authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTOR"))) {
			Object principal = authentication.getPrincipal();
			if (principal instanceof CustomUserDetails) {
				Usuario usuario = ((CustomUserDetails) principal).getUsuario();
				if (usuario instanceof GestorInstitucional) {
					centroId = ((GestorInstitucional) usuario).getCentro().getId();
				}
			}
		}

		Page<Alumno> pagina = alumnoService.obtenerAlumnos(pageable, centroId, search, sexo, anioInicio, anioFin);
		return ResponseEntity.ok(pagina);
	}

	@PutMapping("/editar/{id}")
	public ResponseEntity<Alumno> editarAlumno(@PathVariable Long id, @RequestBody Alumno alumno) {
		Alumno alumnoActualizado = alumnoService.editarAlumno(id, alumno);
		if (alumnoActualizado == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(alumnoActualizado);
	}

	@DeleteMapping("/eliminar/{id}")
	public ResponseEntity<Void> eliminarAlumno(@PathVariable Long id) {
		alumnoService.eliminarAlumno(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{id}")
	public ResponseEntity<AlumnoDetalleDTO> obtenerAlumnoPorId(@PathVariable Long id) {
		AlumnoDetalleDTO alumno = alumnoService.obtenerAlumnoPorId(id);
		return ResponseEntity.ok(alumno);
	}

	@GetMapping("/dni/{dni}")
	public ResponseEntity<AlumnoDetalleDTO> obtenerAlumnoPorDni(@PathVariable String dni) {
		AlumnoDetalleDTO alumno = alumnoService.obtenerAlumnoPorDni(dni);

		if (alumno == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(alumno);
	}

}
