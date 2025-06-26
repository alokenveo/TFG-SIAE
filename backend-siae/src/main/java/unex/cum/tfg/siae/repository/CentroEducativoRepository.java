package unex.cum.tfg.siae.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.CentroEducativo;

@Repository
public interface CentroEducativoRepository extends JpaRepository<CentroEducativo, Long> {

}
