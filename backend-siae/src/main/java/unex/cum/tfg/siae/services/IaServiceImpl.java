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
			map.put("alumno_id", p.getAlumno().getId());
			map.put("nombre", p.getAlumno().getNombre());
			map.put("apellidos", p.getAlumno().getApellidos());
			map.put("dni", p.getAlumno().getDni()); // Opcional

			// Datos de la Predicción
			map.put("prob_repetir", p.getProbRepetir());
			map.put("prob_abandono", p.getProbAbandono());
			map.put("n_suspensos_predichos", p.getnSuspensosPredichos());

			// Convertir el String JSON guardado en BD a List<Map> real
			try {
				if (p.getDetalleJson() != null) {
					List<Map<String, Object>> asignaturas = mapper.readValue(p.getDetalleJson(),
							new TypeReference<List<Map<String, Object>>>() {
							});
					Map<String, Object> detalle = new HashMap<>();
					detalle.put("asignaturas", asignaturas);
					detalle.put("recomendaciones_globales", new ArrayList<>());
					map.put("detalle", detalle);
				}
			} catch (Exception e) {
				map.put("asignaturas", new ArrayList<>());
				System.err.println("Error parseando JSON prediccion id: " + p.getId() + "; ERROR: " + e.getMessage());
			}

			return map;
		}).collect(Collectors.toList());
	}

	@Override
	public Map<String, Object> getPrediccionAgregada(int anioAcademico, String nivel) {
		Map<String, Object> resultado = new HashMap<>();
		ObjectMapper mapper = new ObjectMapper();

		if ("provincia".equals(nivel)) {
			List<PrediccionProvincia> listado = predProvinciaRepo.findByAnioAcademico(anioAcademico);
			List<Map<String, Object>> filas = listado.stream().map(prov -> {
				Map<String, Object> map = new HashMap<>();
				map.put("provincia", prov.getProvincia());
				map.put("tasa_suspensos_predicha", prov.getTasaSuspensosPredicha());
				map.put("nota_media", prov.getNotaMedia());
				map.put("num_alumnos", prov.getNumAlumnos());
				map.put("impacto_ratio", prov.getImpactoRatio());
				map.put("tasa_si_10_docentes_mas", prov.getTasaSi10DocentesMas());
				return map;
			}).collect(Collectors.toList());

			resultado.put("agregados", filas);

			// Parse JSONs (assume one prov for simplicity, or aggregate if multiple)
			if (!listado.isEmpty()) {
				PrediccionProvincia firstProv = listado.get(0);
				try {
					if (firstProv.getJsonTendencias() != null) {
						List<Map<String, Object>> tendencias = mapper.readValue(firstProv.getJsonTendencias(),
								new TypeReference<>() {
								});
						resultado.put("tendencias", tendencias);
					}
					if (firstProv.getJsonDisparidades() != null) {
						List<Map<String, Object>> disparidades = mapper.readValue(firstProv.getJsonDisparidades(),
								new TypeReference<>() {
								});
						resultado.put("disparidades", disparidades);
					}
				} catch (Exception e) {
					// Log error, skip
				}
			}
		} else if ("centro_educativo_id".equals(nivel)) {
			// Similar to provincia, add all fields and parse JSONs
			List<PrediccionCentro> listado = predCentroRepo.findByAnioAcademico(anioAcademico);
			List<Map<String, Object>> filas = listado.stream().map(centro -> {
				Map<String, Object> map = new HashMap<>();
				map.put("centro_id", centro.getCentro().getId());
				map.put("nombre_centro", centro.getCentro().getNombre());
				map.put("tasa_suspensos_predicha", centro.getTasaSuspensosPredicha());
				map.put("nota_media", centro.getNotaMedia());
				map.put("num_alumnos", centro.getNumAlumnos());
				map.put("impacto_ratio", centro.getImpactoRatio());
				map.put("tasa_si_10_docentes_mas", centro.getTasaSi10DocentesMas());
				map.put("ranking", centro.getRankingRiesgo());
				return map;
			}).collect(Collectors.toList());

			resultado.put("agregados", filas);

			// Parse JSONs similarly
			if (!listado.isEmpty()) {
				PrediccionCentro firstCentro = listado.get(0);
				try {
					if (firstCentro.getJsonTendencias() != null) {
						List<Map<String, Object>> tendencias = mapper.readValue(firstCentro.getJsonTendencias(),
								new TypeReference<>() {
								});
						resultado.put("tendencias", tendencias);
					}
					if (firstCentro.getJsonDisparidades() != null) {
						List<Map<String, Object>> disparidades = mapper.readValue(firstCentro.getJsonDisparidades(),
								new TypeReference<>() {
								});
						resultado.put("disparidades", disparidades);
					}
				} catch (Exception e) {
					// Log
				}
			}
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
			map.put("nivel_id", p.getNivelId());
			map.put("curso_orden", p.getCursoOrden());
			map.put("asignatura_nombre", p.getAsignatura().getNombre());
			map.put("tasa_suspensos_predicha", p.getTasaSuspensosPredicha()); // Corrige nombre
			map.put("n_alumnos", p.getNAlumnos());
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