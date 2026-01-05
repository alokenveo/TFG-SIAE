package unex.cum.tfg.siae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.PrediccionProvincia;

@Repository
public interface PrediccionProvinciaRepository extends JpaRepository<PrediccionProvincia, Long>{
	List<PrediccionProvincia> findByAnioAcademico(Integer anio);
}
