package unex.cum.tfg.siae.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import unex.cum.tfg.siae.model.PrediccionAlumno;
import unex.cum.tfg.siae.model.PrediccionAsignatura;
import unex.cum.tfg.siae.model.PrediccionCentro;
import unex.cum.tfg.siae.model.PrediccionProvincia;
import unex.cum.tfg.siae.repository.PrediccionAlumnoRepository;
import unex.cum.tfg.siae.repository.PrediccionAsignaturaRepository;
import unex.cum.tfg.siae.repository.PrediccionCentroRepository;
import unex.cum.tfg.siae.repository.PrediccionProvinciaRepository;

@Service
public class IaServiceImpl implements IaService {

	private final RestTemplate restTemplate;
	private final PrediccionAlumnoRepository predAlumnoRepo;
	private final PrediccionCentroRepository predCentroRepo;
	private final PrediccionProvinciaRepository predProvinciaRepo;
	private final PrediccionAsignaturaRepository predAsignaturaRepo;

	@Value("${siae.ia-service.url}")
	private String iaServiceUrl;

	public IaServiceImpl(RestTemplate restTemplate, PrediccionProvinciaRepository predProvinciaRepo,
			PrediccionCentroRepository predCentroRepo, PrediccionAsignaturaRepository predAsignaturaRepo,
			PrediccionAlumnoRepository predAlumnoRepo) {
		this.restTemplate = restTemplate;
		this.predAlumnoRepo = predAlumnoRepo;
		this.predCentroRepo = predCentroRepo;
		this.predProvinciaRepo = predProvinciaRepo;
		this.predAsignaturaRepo = predAsignaturaRepo;
	}

	private final ObjectMapper mapper = new ObjectMapper();

	@Override
	public List<Map<String, Object>> getPrediccionAlumnosRiesgo(Long centroId, int anioAcademico) {
		// 1. Buscamos en BD local (¡Milisegundos!)
		List<PrediccionAlumno> predicciones = predAlumnoRepo.findByAlumno_CentroEducativoIdAndAnioAcademico(centroId,
				anioAcademico);

		// 2. Transformamos la entidad a lo que espera el Frontend
		return predicciones.stream().map(p -> {
			Map<String, Object> map = new HashMap<>();

			// Datos del Alumno (gracias al @ManyToOne)
			map.put("alumnoId", p.getAlumno().getId());
			map.put("nombre", p.getAlumno().getNombre());
			map.put("apellidos", p.getAlumno().getApellidos());
			map.put("dni", p.getAlumno().getDni()); // Opcional

			// Datos de la Predicción
			map.put("riesgo_global", p.getRiesgoGlobal());
			map.put("n_suspensos_predichos", p.getnSuspensosPredichos());

			// Convertir el String JSON guardado en BD a List<Map> real
			try {
				if (p.getDetalleJson() != null) {
					List<Map<String, Object>> detalle = mapper.readValue(p.getDetalleJson(),
							new TypeReference<List<Map<String, Object>>>() {
							});
					map.put("predicciones", detalle);
				}
			} catch (Exception e) {
				map.put("predicciones", new ArrayList<>());
				System.err.println("Error parseando JSON prediccion id: " + p.getId());
			}

			return map;
		}).collect(Collectors.toList());
	}

	@Override
	public Map<String, Object> getPrediccionAgregada(int anioAcademico, String nivel) {
		Map<String, Object> resultado = new HashMap<>();

		if ("provincia".equals(nivel)) {
			// Cargar datos de todas las provincias
			List<PrediccionProvincia> listado = predProvinciaRepo.findByAnioAcademico(anioAcademico);

			// Convertir a formato DataFrame-like para el front
			List<Map<String, Object>> filas = listado.stream().map(prov -> Map.of("provincia",
					(Object) prov.getProvincia(), "tasa_suspensos_predicha", prov.getTasaSuspensosMedia()))
					.collect(Collectors.toList());

			resultado.put("agregados", filas);

		} else if ("centro_educativo_id".equals(nivel) || "centro".equals(nivel)) {
			List<PrediccionCentro> listado = predCentroRepo.findByAnioAcademico(anioAcademico);

			List<Map<String, Object>> filas = listado.stream().map(centro -> {
				Map<String, Object> map = new HashMap<>();
				// Ojo: Asegúrate de que tu entidad PrediccionCentro tiene acceso al nombre del
				// centro
				map.put("centro_id", centro.getCentro().getId()); // Asumiendo getCentro()
				map.put("nombre_centro", centro.getCentro().getNombre()); // Asumiendo getNombre()
				map.put("tasa_suspensos_media", centro.getTasaSuspensosMedia());
				map.put("ranking", centro.getRankingRiesgo());
				return map;
			}).collect(Collectors.toList());

			resultado.put("agregados", filas);
		}

		return resultado;
	}

	@Override
	public List<Map<String, Object>> getRendimientoPorAsignatura() {
		// Asumimos año actual (2025) o lo pasamos como parámetro
		int anioActual = 2025;
		List<PrediccionAsignatura> preds = predAsignaturaRepo.findByAnioAcademico(anioActual);

		return preds.stream().map(p -> {
			Map<String, Object> map = new HashMap<>();
			map.put("asignatura_nombre", p.getAsignatura().getNombre());
			map.put("tasa_suspensos_media", p.getTasaSuspensosPredicha());
			map.put("dificultad", p.getDificultadPercibida());
			return map;
		}).collect(Collectors.toList());
	}

	@SuppressWarnings("rawtypes")
	@Override
	public String ejecutarRecalculoIA() {
		try {
			// Llamamos al endpoint "Trigger" de Python
			String url = iaServiceUrl + "/admin/run-batch";

			// Usamos postForEntity porque es una petición POST
			ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);

			if (response.getStatusCode().is2xxSuccessful()) {
				return "Proceso de IA iniciado correctamente. Los datos se actualizarán en breve.";
			} else {
				return "Error: Python respondió con estado " + response.getStatusCode();
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "Error de conexión con el servicio de IA: " + e.getMessage();
		}
	}
}