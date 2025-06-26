package unex.cum.tfg.siae.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.model.MatriculaDTO;
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

}
