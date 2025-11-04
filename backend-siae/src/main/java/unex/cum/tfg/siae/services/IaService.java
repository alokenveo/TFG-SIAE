package unex.cum.tfg.siae.services;

import java.util.List;
import java.util.Map;

public interface IaService {
	List<Map<String, Object>> getPrediccionAlumnosRiesgo(Long centroId, int anioAcademico);

	Map<String, Object> getPrediccionAgregada(int anioAcademico, String nivel);

	List<Map<String, Object>> getRendimientoPorAsignatura();
}
