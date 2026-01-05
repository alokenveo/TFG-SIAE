package unex.cum.tfg.siae.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.PrediccionAlumno;

@Repository
public interface PrediccionAlumnoRepository extends JpaRepository<PrediccionAlumno, Long> {

	// Buscar predicción de un alumno para un año concreto
	Optional<PrediccionAlumno> findByAlumnoIdAndAnioAcademico(Long alumnoId, Integer anioAcademico);

	// Buscar todas las predicciones de un año
	List<PrediccionAlumno> findByAnioAcademico(Integer anioAcademico);

	// Buscar alumnos con alto riesgo en un centro específico
	List<PrediccionAlumno> findByAlumno_CentroEducativoIdAndAnioAcademico(Long centroId, Integer anioAcademico);
}