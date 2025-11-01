package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.model.dto.MatriculaDTO;

public interface MatriculaService {

	Matricula registrarMatricula(MatriculaDTO dto);
	
	Page<Matricula> obtenerMatriculas(Pageable pageable, Long centroId, String search, Long cursoId, Integer anioAcademico);

	List<Matricula> obtenerMatriculasPorAlumno(Long alumnoId);

	List<Integer> obtenerAnios();
}