package unex.cum.tfg.siae.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.NivelEducativo;

@Repository
public interface NivelEducativoRepository extends JpaRepository<NivelEducativo, Long>{

}
