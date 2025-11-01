package unex.cum.tfg.siae.controller;

import java.util.List;

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

import unex.cum.tfg.siae.model.GestorInstitucional;
import unex.cum.tfg.siae.model.Personal;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.model.dto.PersonalDTO;
import unex.cum.tfg.siae.security.CustomUserDetails;
import unex.cum.tfg.siae.services.PersonalService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/personal")
public class PersonalController {

	@Autowired
	private PersonalService personalService;

	@PostMapping("/registrar")
	public ResponseEntity<Personal> registrarPersonal(@RequestBody PersonalDTO dto) {
		Personal nuevoPersonal = personalService.registrarPersonal(dto);
		return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPersonal);
	}

	@GetMapping("/lista")
	public ResponseEntity<Page<Personal>> obtenerTodoElPersonal(@RequestParam(required = false) String search,
			@RequestParam(required = false) String cargo,
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

		Page<Personal> pagina = personalService.obtenerPersonal(pageable, centroId, search, cargo);
		return ResponseEntity.ok(pagina);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Personal> obtenerPersonalPorId(@PathVariable Long id) {
		Personal personal = personalService.obtenerPersonalPorId(id);
		return ResponseEntity.ok(personal);
	}

	@PutMapping("/editar/{id}")
	public ResponseEntity<Personal> editarPersonal(@PathVariable Long id, @RequestBody PersonalDTO dto) {
		Personal personalActualizado = personalService.editarPersonal(id, dto);
		return ResponseEntity.ok(personalActualizado);
	}

	@DeleteMapping("/eliminar/{id}")
	public ResponseEntity<Void> eliminarPersonal(@PathVariable Long id) {
		personalService.eliminarPersonal(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/cargos")
	public ResponseEntity<List<String>> obtenerCargos() {
		List<String> cargos = personalService.obtenerCargos();
		return ResponseEntity.ok(cargos);
	}

}