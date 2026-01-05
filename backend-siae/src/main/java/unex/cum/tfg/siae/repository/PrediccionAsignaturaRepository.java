package unex.cum.tfg.siae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.PrediccionAsignatura;

@Repository
public interface PrediccionAsignaturaRepository extends JpaRepository<PrediccionAsignatura, Long> {
	List<PrediccionAsignatura> findByAnioAcademico(Integer anio);
}
