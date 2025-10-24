package unex.cum.tfg.siae.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.Nota;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {

	List<Nota> findByAlumnoId(Long alumnoId);

	List<Nota> findByAlumnoIdAndCursoId(Long alumnoId, Long cursoId);

	List<Nota> findByAlumnoIdAndAsignaturaId(Long alumnoId, Long asignaturaId);

	List<Nota> findByCursoId(Long cursoId);

	List<Nota> findByAsignaturaId(Long asignaturaId);

	Optional<Nota> findByAlumnoIdAndCursoIdAndAsignaturaIdAndAnioAcademico(Long alumnoId, Long cursoId,
			Long asignaturaId, int anioAcademico);

	List<Nota> findByAlumnoIdAndCursoIdAndAsignaturaId(Long alumnoId, Long cursoId, Long asignaturaId);

	List<Nota> findByCursoIdAndAsignaturaId(Long cursoId, Long asignaturaId);

	List<Nota> findByCursoIdAndAsignaturaIdOrderByCalificacionDesc(Long cursoId, Long asignaturaId);

	@Query("SELECT AVG(n.calificacion) FROM Nota n WHERE n.alumno.id = :alumnoId AND n.curso.id = :cursoId")
	Double obtenerPromedioPorAlumnoYCurso(@Param("alumnoId") Long alumnoId, @Param("cursoId") Long cursoId);
}
