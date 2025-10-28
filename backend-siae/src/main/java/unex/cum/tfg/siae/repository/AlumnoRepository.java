package unex.cum.tfg.siae.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.Alumno;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Long> {

	@Query("SELECT DISTINCT m.alumno FROM Matricula m WHERE m.centroEducativo.id = :centroId")
	List<Alumno> findAlumnosByCentroId(Long centroId);
	
	@Query("SELECT a FROM Alumno a WHERE a.matriculas IS EMPTY")
    List<Alumno> findAlumnosSinCentro();
	
	boolean existsByDni(String dni);

	boolean existsByDniAndIdNot(String dni, Long id);

	Optional<Alumno> findByDni(String dni);

}
