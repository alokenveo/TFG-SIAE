package unex.cum.tfg.siae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.services.CentroEducativoService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/centros")
public class CentroEducativoController {
	
	@Autowired
	private CentroEducativoService centroEducativoService;
	
	@GetMapping("/lista")
	public ResponseEntity<List<CentroEducativo>> obtenerTodosLosCentros() {
	    List<CentroEducativo> centros = centroEducativoService.obtenerTodosLosCentros();

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

}
