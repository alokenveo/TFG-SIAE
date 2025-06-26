package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.Administrador;
import unex.cum.tfg.siae.model.GestorDTO;
import unex.cum.tfg.siae.model.Invitado;
import unex.cum.tfg.siae.model.Usuario;

public interface UsuarioService {

	Usuario registrarGestor(GestorDTO dto);
	
	Usuario registrarAdministrador(Administrador admin);
	
	Usuario registrarInvitador(Invitado invitado);

	boolean existeUsuario(Usuario usuario);
	
	List<Usuario> obtenerUsuarios();
}
