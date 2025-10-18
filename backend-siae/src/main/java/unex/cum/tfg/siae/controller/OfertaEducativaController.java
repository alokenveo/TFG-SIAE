package unex.cum.tfg.siae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.Asignatura;
import unex.cum.tfg.siae.model.Curso;
import unex.cum.tfg.siae.model.NivelEducativo;
import unex.cum.tfg.siae.services.AsignaturaService;
import unex.cum.tfg.siae.services.CursoService;
import unex.cum.tfg.siae.services.NivelEducativoService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/oferta-educativa")
public class OfertaEducativaController {

	@Autowired
	private NivelEducativoService nivelEducativoService;
	@Autowired
	private CursoService cursoService;
	@Autowired
	private AsignaturaService asignaturaService;

	@GetMapping("/niveles")
	public ResponseEntity<List<NivelEducativo>> obtenerNiveles() {
		List<NivelEducativo> nivelesEducativos = nivelEducativoService.obtenerNiveles();
		return ResponseEntity.ok(nivelesEducativos);
	}

	@GetMapping("/cursos")
	public ResponseEntity<List<Curso>> obtenerCursos() {
		List<Curso> cursos = cursoService.obtenerCursos();
		return ResponseEntity.ok(cursos);
	}

	@GetMapping("/cursos/por-nivel/{nivelId}")
	public ResponseEntity<List<Curso>> obtenerCursosPorNivel(@PathVariable Long nivelId) {
		List<Curso> cursos = cursoService.obtenerCursosPorNivel(nivelId);
        return ResponseEntity.ok(cursos);
	}

	@GetMapping("/asignaturas")
	public ResponseEntity<List<Asignatura>> obtenerAsignaturas() {
		List<Asignatura> asignaturas = asignaturaService.obtenerAsignaturas();
		return ResponseEntity.ok(asignaturas);
	}

	@GetMapping("/asignaturas/por-curso/{cursoId}")
	public ResponseEntity<List<Asignatura>> obtenerAsignaturasPorCurso(@PathVariable Long cursoId) {
		List<Asignatura> asignaturas = asignaturaService.obtenerAsignaturasPorCurso(cursoId);
        return ResponseEntity.ok(asignaturas);
	}
}
