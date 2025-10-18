package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.Nota;
import unex.cum.tfg.siae.model.NotaDTO;

public interface NotaService {
	
	Nota registrarNota(NotaDTO dto);
	
	List<Nota> obtenerNotas();
	
	List<Nota> obtenerNotasPorAlumno(Long alumnoId);
}
