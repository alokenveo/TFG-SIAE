package unex.cum.tfg.siae.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.repository.MatriculaRepository;

@Service
public class IaServiceImpl implements IaService {

	private final MatriculaRepository matriculaRepository;
	private final RestTemplate restTemplate;

	@Value("${siae.ia-service.url}")
	private String iaServiceUrl;

	public IaServiceImpl(MatriculaRepository matriculaRepository, RestTemplate restTemplate) {
		this.matriculaRepository = matriculaRepository;
		this.restTemplate = restTemplate;
	}

	@Override
	public List<Map<String, Object>> getPrediccionAlumnosRiesgo(Long centroId, int anioAcademico) {
	    List<Matricula> matriculas = matriculaRepository.findByCentroEducativoIdAndAnioAcademico(centroId, anioAcademico);
	    
	    List<Integer> alumnoIds = matriculas.stream()
	            .map(m -> Math.toIntExact(m.getAlumno().getId()))
	            .collect(Collectors.toList());

	    Map<String, List<Integer>> requestBody = Map.of("alumno_ids", alumnoIds);
	    List<Map<String, Object>> resultados = new ArrayList<>();

	    try {
	        String url = iaServiceUrl + "/predict/alumnos";
	        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(requestBody), Map.class);

	        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
	            resultados = (List<Map<String, Object>>) response.getBody().get("resultados");
	        }
	    } catch (Exception e) {
	        System.err.println("Error al contactar IA (/predict/alumnos): " + e.getMessage());
	    }

	    for (Map<String, Object> r : resultados) {
	        Integer alumnoId = (Integer) r.get("alumno_id");
	        matriculas.stream()
	                .filter(m -> Math.toIntExact(m.getAlumno().getId()) == alumnoId)
	                .findFirst()
	                .ifPresent(m -> {
	                    r.put("nombre", m.getAlumno().getNombre());
	                    r.put("apellidos", m.getAlumno().getApellidos());
	                    r.put("dni", m.getAlumno().getDni());
	                });
	    }

	    return resultados;
	}


	@Override
	public Map<String, Object> getPrediccionAgregada(int anioAcademico, String nivel) {
		// Preparar body para /predict/agregadas (nivel: provincia o centro)
		Map<String, String> requestBody = Map.of("nivel", nivel);

		try {
			String url = iaServiceUrl + "/predict/agregadas";
			ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(requestBody),
					Map.class);
			if (response.getStatusCode().is2xxSuccessful()) {
				return response.getBody();
			}
		} catch (Exception e) {
			System.err.println("Error al contactar IA (/predict/agregadas): " + e.getMessage());
		}
		return Map.of();
	}

	@Override
	public List<Map<String, Object>> getRendimientoPorAsignatura() {
		try {
			String url = iaServiceUrl + "/predict/rendimiento";
			ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
			if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				return (List<Map<String, Object>>) response.getBody().get("resultados");
			}
		} catch (Exception e) {
			System.err.println("Error al contactar IA (/predict/rendimiento): " + e.getMessage());
		}
		return new ArrayList<>();
	}
}