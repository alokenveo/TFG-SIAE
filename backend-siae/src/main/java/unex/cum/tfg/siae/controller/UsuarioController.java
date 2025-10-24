package unex.cum.tfg.siae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import unex.cum.tfg.siae.model.Administrador;
import unex.cum.tfg.siae.model.Invitado;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.model.dto.GestorDTO;
import unex.cum.tfg.siae.services.UsuarioService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/usuarios")
public class UsuarioController {

	@Autowired
	private UsuarioService usuarioService;

	@PostMapping("/registrar-gestor")
	public ResponseEntity<?> registrarGestor(@RequestBody GestorDTO dto) {
		try {
			usuarioService.registrarGestor(dto);
			return ResponseEntity.ok("Gestor registrado correctamente");
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PostMapping("/registrar-admin")
	public ResponseEntity<?> registrarAdmin(@RequestBody Administrador admin) {
		try {
			usuarioService.registrarAdministrador(admin);
			return ResponseEntity.ok("Administrador registrado correctamente");
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PostMapping("/registrar-invitado")
	public ResponseEntity<?> registrarInvitado(@RequestBody Invitado inv) {
		try {
			usuarioService.registrarInvitador(inv);
			return ResponseEntity.ok("Invitado registrado correctamente");
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/lista")
	public ResponseEntity<List<Usuario>> obtenerUsuarios() {
		List<Usuario> usuarios = usuarioService.obtenerUsuarios();
		if (usuarios.isEmpty()) {
			return ResponseEntity.noContent().build();
		}

		return ResponseEntity.ok(usuarios);
	}

	@PutMapping("/editar/{id}")
	public ResponseEntity<Usuario> editarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
		Usuario usuarioActualizado = usuarioService.editarUsuario(id, usuario);
		if (usuarioActualizado == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(usuarioActualizado);
	}

	@DeleteMapping("/eliminar/{id}")
	public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
		usuarioService.eliminarUsuario(id);
		return ResponseEntity.noContent().build();
	}
}
