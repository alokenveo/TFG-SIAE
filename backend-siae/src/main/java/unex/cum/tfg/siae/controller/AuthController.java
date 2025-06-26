package unex.cum.tfg.siae.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.Autenticacion;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.services.AutenticacionService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	
	@Autowired
	private AutenticacionService autenticacionService;
	
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Autenticacion auth){
		Usuario usuario=autenticacionService.login(auth);
		if(usuario==null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
		}
		return ResponseEntity.ok(usuario);
	}

}
