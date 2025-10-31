package unex.cum.tfg.siae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.Matricula;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

	List<Matricula> findByCentroEducativoId(Long centroId);

	Long countByAnioAcademico(int anioAcademico);

	Long countByCentroEducativoIdAndAnioAcademico(Long centroId, int anioAcademico);

	@Query("SELECT m.centroEducativo.provincia, COUNT(DISTINCT m.alumno.id) FROM Matricula m "
			+ "WHERE m.anioAcademico = :anio " + "GROUP BY m.centroEducativo.provincia")
	List<Object[]> countAlumnosByProvincia(@Param("anio") int anio);

	List<Matricula> findByCentroEducativoIdAndAnioAcademico(Long centroId, int anioAcademico);

	@Query("SELECT m.curso.nivel.nombre, COUNT(m) FROM Matricula m "
			+ "WHERE m.centroEducativo.id = :centroId AND m.anioAcademico = :anio " + "GROUP BY m.curso.nivel.nombre")
	List<Object[]> countAlumnosByNivelCentro(@Param("centroId") Long centroId, @Param("anio") int anio);

	List<Matricula> findByAnioAcademico(int anioAcademico);

}
