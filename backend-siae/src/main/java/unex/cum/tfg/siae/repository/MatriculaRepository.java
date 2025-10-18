package unex.cum.tfg.siae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unex.cum.tfg.siae.model.Matricula;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

	List<Matricula> findByCentroEducativoId(Long centroId);

}
