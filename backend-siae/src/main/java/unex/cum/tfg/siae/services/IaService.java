package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.dto.AlumnoEnRiesgoDTO;
import unex.cum.tfg.siae.model.dto.RiesgoProvinciaResponseDTO;

public interface IaService {
	List<AlumnoEnRiesgoDTO> getPrediccionAlumnosRiesgo(Long centroId, int anioAcademico, String evaluacion);

	List<RiesgoProvinciaResponseDTO> getPrediccionAgregada(int anioAcademico);
}
