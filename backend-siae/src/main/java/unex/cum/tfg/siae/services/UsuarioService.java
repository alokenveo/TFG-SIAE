package unex.cum.tfg.siae.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import unex.cum.tfg.siae.model.Administrador;
import unex.cum.tfg.siae.model.Invitado;
import unex.cum.tfg.siae.model.Usuario;
import unex.cum.tfg.siae.model.dto.GestorDTO;

public interface UsuarioService {

	Usuario registrarGestor(GestorDTO dto);

	Usuario registrarAdministrador(Administrador admin);

	Usuario registrarInvitador(Invitado invitado);

	boolean existeUsuario(Usuario usuario);

	Page<Usuario> obtenerUsuarios(Pageable pageable, String search, String rol);

	Usuario editarUsuario(Long id, Usuario usuario);

	void eliminarUsuario(Long id);

	void generatePasswordResetToken(String correo);

	boolean resetPassword(String token, String nuevaPassword);
}