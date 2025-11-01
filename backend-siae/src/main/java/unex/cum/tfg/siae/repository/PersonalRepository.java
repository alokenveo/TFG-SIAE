package unex.cum.tfg.siae.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.Personal;

@Repository
public interface PersonalRepository extends JpaRepository<Personal, Long>, JpaSpecificationExecutor<Personal> {

	List<Personal> findByCentroEducativoId(Long centroId);

	Optional<Personal> findByDni(String dni);

	boolean existsByDni(String dni);

	boolean existsByDniAndIdNot(String dni, Long id);
	
	Long countByCentroEducativoId(Long centroId);

	@Query("SELECT DISTINCT p.cargo FROM Personal p ORDER BY p.cargo ASC")
	List<String> findDistinctCargo();

}
