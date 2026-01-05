package unex.cum.tfg.siae.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.PrediccionCentro;

@Repository
public interface PrediccionCentroRepository extends JpaRepository<PrediccionCentro, Long> {
	Optional<PrediccionCentro> findByCentroIdAndAnioAcademico(Long centroId, Integer anio);

	List<PrediccionCentro> findByAnioAcademico(Integer anio);
}
