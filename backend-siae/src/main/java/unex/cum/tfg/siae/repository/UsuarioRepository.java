package unex.cum.tfg.siae.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	Optional<Usuario> findByCorreo(String correo);

	boolean existsByCorreo(String correo);
	
	Optional<Usuario> findByResetToken(String resetToken);
}
