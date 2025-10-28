package unex.cum.tfg.siae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.Provincia;

@Repository
public interface CentroEducativoRepository extends JpaRepository<CentroEducativo, Long> {

	List<CentroEducativo> findByProvincia(Provincia provincia);

}
