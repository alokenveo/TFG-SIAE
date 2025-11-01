package unex.cum.tfg.siae.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.Alumno;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Long>, JpaSpecificationExecutor<Alumno> {

	boolean existsByDni(String dni);

	boolean existsByDniAndIdNot(String dni, Long id);

	Optional<Alumno> findByDni(String dni);

}
