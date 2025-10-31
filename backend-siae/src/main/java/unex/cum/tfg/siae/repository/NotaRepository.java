package unex.cum.tfg.siae.repository;

import java.util.List;
import java.util.Map;
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

	Optional<Nota> findByAlumnoIdAndCursoIdAndAsignaturaIdAndAnioAcademicoAndEvaluacion(Long alumnoId, Long cursoId,
			Long asignaturaId, int anioAcademico, String evaluacion);

	@Query("SELECT AVG(n.calificacion) FROM Nota n")
	Double findAverageNacional();

	@Query("SELECT AVG(n.calificacion) FROM Nota n " + "JOIN n.alumno a " + "JOIN a.matriculas m "
			+ "WHERE m.centroEducativo.id = :centroId")
	Double findAverageByCentroId(@Param("centroId") Long centroId);

	@Query("SELECT n.evaluacion, AVG(n.calificacion) FROM Nota n " + "WHERE n.anioAcademico = :anio "
			+ "GROUP BY n.evaluacion")
	List<Object[]> findAverageNacionalByEvaluacion(@Param("anio") int anio);

	@Query("SELECT n.evaluacion, AVG(n.calificacion) FROM Nota n " + "JOIN n.alumno a " + "JOIN a.matriculas m "
			+ "WHERE m.centroEducativo.id = :centroId AND n.anioAcademico = :anio " + "GROUP BY n.evaluacion")
	List<Object[]> findAverageByCentroIdAndEvaluacion(@Param("centroId") Long centroId, @Param("anio") int anio);

	@Query("SELECT n FROM Nota n "
			+ "WHERE n.alumno.id = :alumnoId AND n.anioAcademico = :anio AND n.evaluacion = :evaluacion")
	List<Nota> findByAlumnoIdAndAnioAcademicoAndEvaluacion(@Param("alumnoId") Long alumnoId, @Param("anio") int anio,
			@Param("evaluacion") String evaluacion);

	@Query("SELECT " + "  SUM(CASE WHEN n.calificacion < 5 THEN 1 ELSE 0 END) as suspensos, "
			+ "  SUM(CASE WHEN n.calificacion >= 5 AND n.calificacion < 7 THEN 1 ELSE 0 END) as aprobados, "
			+ "  SUM(CASE WHEN n.calificacion >= 7 AND n.calificacion < 9 THEN 1 ELSE 0 END) as notables, "
			+ "  SUM(CASE WHEN n.calificacion >= 9 THEN 1 ELSE 0 END) as sobresalientes "
			+ "FROM Nota n WHERE n.anioAcademico = :anio")
	Map<String, Long> findGradeDistributionNacional(@Param("anio") int anio);

	@Query("SELECT n.asignatura.nombre, AVG(n.calificacion) FROM Nota n " + "WHERE n.anioAcademico = :anio "
			+ "GROUP BY n.asignatura.nombre")
	List<Object[]> findAverageByAsignaturaNacional(@Param("anio") int anio);
}
