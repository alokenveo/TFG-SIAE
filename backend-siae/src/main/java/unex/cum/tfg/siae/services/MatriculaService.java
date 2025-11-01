package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.model.dto.MatriculaDTO;

public interface MatriculaService {

	Matricula registrarMatricula(MatriculaDTO dto);
	
	List<Matricula> obtenerMatriculas();

	List<Matricula> obtenerMatriculasPorCentro(Long centroId);

	List<Matricula> obtenerMatriculasPorAlumno(Long alumnoId);
}
