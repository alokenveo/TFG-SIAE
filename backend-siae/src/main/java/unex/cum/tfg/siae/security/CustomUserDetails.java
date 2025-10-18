package unex.cum.tfg.siae.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import unex.cum.tfg.siae.model.Usuario;

public class CustomUserDetails extends User {

	private final Usuario usuario;

	public CustomUserDetails(Usuario usuario, Collection<? extends GrantedAuthority> authorities) {
		super(usuario.getCorreo(), usuario.getPassword(), authorities);
		this.usuario = usuario;
	}

	public Usuario getUsuario() {
		return usuario;
	}
}
