package unex.cum.tfg.siae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
		List<Alumno> alumnos = alumnoService.obtenerAlumnos();

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

}
