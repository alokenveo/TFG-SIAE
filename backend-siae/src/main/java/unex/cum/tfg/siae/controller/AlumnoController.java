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

import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Usuario;
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
	public ResponseEntity<List<Alumno>> obtenerTodosLosAlumnos() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		List<Alumno> alumnos = null;

		if (authentication != null
				&& authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTOR"))) {
			Object principal = authentication.getPrincipal();
			if (principal instanceof CustomUserDetails) {
				Usuario usuario = ((CustomUserDetails) principal).getUsuario();
				if (usuario instanceof GestorInstitucional) {
					Long centroId = ((GestorInstitucional) usuario).getCentro().getId();
					alumnos = alumnoService.obtenerAlumnosPorCentro(centroId);
				}
			}
		} else {
			alumnos = alumnoService.obtenerAlumnos();
		}

		if (alumnos.isEmpty()) {
			return ResponseEntity.noContent().build();
		}

		return ResponseEntity.ok(alumnos);
	}

	@GetMapping("/lista-sin-centro")
	public ResponseEntity<List<Alumno>> obtenerAlumnosSinCentro() {
		List<Alumno> alumnos = alumnoService.obtenerAlumnosSinCentro();

		if (alumnos.isEmpty()) {
			return ResponseEntity.noContent().build();
		}

		return ResponseEntity.ok(alumnos);
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
	public ResponseEntity<Alumno> obtenerAlumnoPorId(@PathVariable Long id) {
		Alumno alumno = alumnoService.obtenerAlumnoPorId(id).get();
		return ResponseEntity.ok(alumno);
	}

}
