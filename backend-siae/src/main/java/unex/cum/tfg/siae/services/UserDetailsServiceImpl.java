package unex.cum.tfg.siae.services;

import java.util.Collection;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.repository.UsuarioRepository;
import unex.cum.tfg.siae.security.CustomUserDetails;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Override
	public UserDetails loadUserByUsername(String correo) {
		Usuario usuario = usuarioRepository.findByCorreo(correo)
				.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con el correo: " + correo));

		return new CustomUserDetails(usuario, getAuthorities(usuario));
	}

	// Mapea nuestro 'getRol()' a un formato que Spring Security entiende
	private Collection<? extends GrantedAuthority> getAuthorities(Usuario usuario) {
		String role;
		String rolObtenido = usuario.getRol();

		if ("ADMIN".equals(rolObtenido)) {
			role = "ROLE_ADMIN";
		} else if ("GESTOR".equals(rolObtenido)) {
			role = "ROLE_GESTOR";
		} else {
			role = "ROLE_INVITADO";
		}

		return Collections.singletonList(new SimpleGrantedAuthority(role));
	}

}
