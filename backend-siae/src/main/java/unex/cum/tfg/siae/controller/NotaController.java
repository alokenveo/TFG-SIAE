package unex.cum.tfg.siae.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.Nota;
import unex.cum.tfg.siae.model.NotaDTO;
import unex.cum.tfg.siae.services.NotaService;

@RestController
@RequestMapping("/api/notas")
public class NotaController {

	@Autowired
	private NotaService notaService;

	@PostMapping
	public ResponseEntity<Nota> registrarNota(@RequestBody NotaDTO dto) {
		Nota nota = notaService.registrarNota(dto);
		return ResponseEntity.ok(nota);
	}
}
