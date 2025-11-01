package unex.cum.tfg.siae.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.NivelEducativo;
import unex.cum.tfg.siae.services.CentroEducativoService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/centros")
public class CentroEducativoController {

	@Autowired
	private CentroEducativoService centroEducativoService;

	@GetMapping("/lista")
	public ResponseEntity<Page<CentroEducativo>> obtenerTodosLosCentros(@RequestParam(required = false) String search,
			@RequestParam(required = false) String tipo, @RequestParam(required = false) String provincia,
			@PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
		Page<CentroEducativo> pagina = centroEducativoService.obtenerCentros(pageable, search, tipo, provincia);
		return ResponseEntity.ok(pagina);
	}

	@PostMapping("/registrar")
	public ResponseEntity<CentroEducativo> registrarCentro(@RequestBody CentroEducativo centro) {
		CentroEducativo nuevoCentro = centroEducativoService.registrarCentroEducativo(centro);
		return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCentro);
	}

	@PutMapping("/editar/{id}")
	public ResponseEntity<CentroEducativo> editarCentro(@PathVariable Long id, @RequestBody CentroEducativo centro) {
		CentroEducativo centroActualizado = centroEducativoService.editarCentroEducativo(id, centro);
		if (centroActualizado == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(centroActualizado);
	}

	@DeleteMapping("/eliminar/{id}")
	public ResponseEntity<Void> eliminarCentro(@PathVariable Long id) {
		centroEducativoService.eliminarCentroEducativo(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/provincia/{provincia}")
	public ResponseEntity<List<CentroEducativo>> obtenerCentrosPorProvincia(@PathVariable String provincia) {
		List<CentroEducativo> centros = centroEducativoService.obtenerCentrosPorProvincia(provincia);
		if (centros == null || centros.isEmpty()) {
			return ResponseEntity.noContent().build();
		}

		return ResponseEntity.ok(centros);
	}

	@GetMapping("/{centroId}/niveles")
	@Transactional(readOnly = true)
	public ResponseEntity<List<NivelEducativo>> obtenerNivelesPorCentro(@PathVariable Long centroId) {
		CentroEducativo centro = centroEducativoService.obtenerCentroPorId(centroId);
		return ResponseEntity.ok(centro.getNiveles());
	}

	@PutMapping("/{centroId}/niveles")
	public ResponseEntity<?> actualizarNivelesCentro(@PathVariable Long centroId, @RequestBody List<Long> nivelIds) {
		centroEducativoService.actualizarNivelesCentro(centroId, nivelIds);
		return ResponseEntity.ok(Map.of("message", "Niveles actualizados correctamente"));
	}

}
