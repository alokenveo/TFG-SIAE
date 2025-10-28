package unex.cum.tfg.siae.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import unex.cum.tfg.siae.model.Autenticacion;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.security.CustomUserDetails;
import unex.cum.tfg.siae.security.JwtTokenProvider;
import unex.cum.tfg.siae.services.UsuarioService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/auth")
public class AuthController {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtTokenProvider tokenProvider;

	@Autowired
	private UsuarioService usuarioService;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Autenticacion authRequest) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(authRequest.getCorreo(), authRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		String token = tokenProvider.generateToken(authentication);

		CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
		Usuario usuario = userDetails.getUsuario();

		Map<String, Object> response = new HashMap<>();
		response.put("token", "Bearer " + token);
		response.put("usuario", usuario);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/request-reset")
	public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> payload) {
		String correo = payload.get("correo");
		if (correo == null || correo.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("error", "Correo es requerido"));
		}
		try {
			usuarioService.generatePasswordResetToken(correo);
			return ResponseEntity.ok(Map.of("message",
					"Si existe una cuenta asociada a ese correo, se ha generado un enlace de reseteo."));
		} catch (Exception e) {
			System.err.println("Error en requestPasswordReset: " + e.getMessage());
			return ResponseEntity.status(500).body(Map.of("error", "Ocurrió un error procesando la solicitud."));
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
		String token = payload.get("token");
		String nuevaPassword = payload.get("nuevaPassword");

		if (token == null || token.isEmpty() || nuevaPassword == null || nuevaPassword.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("error", "Token y nueva contraseña son requeridos"));
		}

		try {
			boolean success = usuarioService.resetPassword(token, nuevaPassword);
			if (success) {
				return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente."));
			} else {
				return ResponseEntity.badRequest().body(Map.of("error", "Token inválido o expirado."));
			}
		} catch (Exception e) {
			System.err.println("Error en resetPassword: " + e.getMessage());
			return ResponseEntity.status(500).body(Map.of("error", "Ocurrió un error al actualizar la contraseña."));
		}
	}

}
