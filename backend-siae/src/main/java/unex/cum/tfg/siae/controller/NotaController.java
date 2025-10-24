package unex.cum.tfg.siae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.Nota;
import unex.cum.tfg.siae.model.dto.NotaDTO;
import unex.cum.tfg.siae.services.NotaService;

@RestController
@RequestMapping("/api/notas")
public class NotaController {

	@Autowired
	private NotaService notaService;

	@PostMapping("/registrar")
	public ResponseEntity<Nota> registrarNota(@RequestBody NotaDTO dto) {
		Nota nota = notaService.registrarNota(dto);
		return ResponseEntity.ok(nota);
	}
	
	@GetMapping("/lista")
    public ResponseEntity<List<Nota>> obtenerNotas() {
        List<Nota> notas = notaService.obtenerNotas();
        return ResponseEntity.ok(notas);
    }

	@GetMapping("/por-alumno/{alumnoId}")
	public ResponseEntity<List<Nota>> obtenerNotasPorAlumno(@PathVariable Long alumnoId) {
		try {
			List<Nota> notas = notaService.obtenerNotasPorAlumno(alumnoId);
			return ResponseEntity.ok(notas);
		} catch (SecurityException e) {
			return ResponseEntity.status(403).build();
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}
}
