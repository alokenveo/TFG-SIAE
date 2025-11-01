package unex.cum.tfg.siae.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.model.Nota;
import unex.cum.tfg.siae.model.dto.AggregationRequestDTO;
import unex.cum.tfg.siae.model.dto.AlumnoEnRiesgoDTO;
import unex.cum.tfg.siae.model.dto.AlumnoEnRiesgoResponseDTO;
import unex.cum.tfg.siae.model.dto.AlumnoInputAgregadoDTO;
import unex.cum.tfg.siae.model.dto.AlumnoInputDTO;
import unex.cum.tfg.siae.model.dto.PredictionRequestDTO;
import unex.cum.tfg.siae.model.dto.RiesgoProvinciaResponseDTO;
import unex.cum.tfg.siae.repository.AlumnoRepository;
import unex.cum.tfg.siae.repository.MatriculaRepository;
import unex.cum.tfg.siae.repository.NotaRepository;

@Service
public class IaServiceImpl implements IaService {

	private final AlumnoRepository alumnoRepository;
	private final MatriculaRepository matriculaRepository;
	private final NotaRepository notaRepository;
	private final RestTemplate restTemplate;

	private static final String EVALUACION_REFERENCIA = "1ª Evaluación";

	@Value("${siae.ia-service.url}")
	private String iaServiceUrl;

	public IaServiceImpl(AlumnoRepository alumnoRepository, MatriculaRepository matriculaRepository,
			NotaRepository notaRepository, RestTemplate restTemplate) {

		this.alumnoRepository = alumnoRepository;
		this.matriculaRepository = matriculaRepository;
		this.notaRepository = notaRepository;
		this.restTemplate = restTemplate;
	}

	@Override
	public List<AlumnoEnRiesgoDTO> getPrediccionAlumnosRiesgo(Long centroId, int anioAcademico, String evaluacion) {
		List<Matricula> matriculas = matriculaRepository.findByCentroEducativoIdAndAnioAcademico(centroId,
				anioAcademico);

		List<AlumnoInputDTO> alumnosInput = matriculas.stream().map(matricula -> {
			List<Nota> notas = notaRepository.findByAlumnoIdAndAnioAcademicoAndEvaluacion(matricula.getAlumno().getId(),
					anioAcademico, evaluacion);

			return new AlumnoInputDTO(matricula.getAlumno().getId(), matricula.getAlumno().getFechaNacimiento(),
					matricula.getCurso().getOrden(), matricula.getCurso().getNivel().getId(),
					notas.stream().map(Nota::getCalificacion).collect(Collectors.toList()));
		}).collect(Collectors.toList());

		PredictionRequestDTO requestBody = new PredictionRequestDTO(alumnosInput);
		List<AlumnoEnRiesgoDTO> alumnosEnRiesgo = new ArrayList<>();

		try {
			String url = iaServiceUrl + "/predict";
			ResponseEntity<AlumnoEnRiesgoResponseDTO[]> response = restTemplate.postForEntity(url, requestBody,
					AlumnoEnRiesgoResponseDTO[].class);

			if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				Arrays.asList(response.getBody())
						.forEach(prediccion -> alumnoRepository.findById(prediccion.alumno_id())
								.ifPresent(alumno -> alumnosEnRiesgo.add(new AlumnoEnRiesgoDTO(alumno,
										prediccion.probabilidad_riesgo(), prediccion.motivo_principal()))));
			}
		} catch (Exception e) {
			System.err.println("Error al contactar el servicio de IA (/predict): " + e.getMessage());
		}
		return alumnosEnRiesgo;
	}

	@Override
	public List<RiesgoProvinciaResponseDTO> getPrediccionAgregada(int anioAcademico) {
		// Obtenemos TODAS las matrículas del año
		List<Matricula> todasLasMatriculas = matriculaRepository.findByAnioAcademico(anioAcademico);

		// Preparamos la lista de DTOs para la IA
		List<AlumnoInputAgregadoDTO> alumnosInput = todasLasMatriculas.stream().map(matricula -> {
			List<Nota> notas = notaRepository.findByAlumnoIdAndAnioAcademicoAndEvaluacion(matricula.getAlumno().getId(),
					anioAcademico, EVALUACION_REFERENCIA);

			return new AlumnoInputAgregadoDTO(matricula.getAlumno().getId(), matricula.getAlumno().getFechaNacimiento(),
					matricula.getCurso().getOrden(), matricula.getCurso().getNivel().getId(),
					notas.stream().map(Nota::getCalificacion).collect(Collectors.toList()),
					matricula.getCentroEducativo().getProvincia().name());
		}).collect(Collectors.toList());

		AggregationRequestDTO requestBody = new AggregationRequestDTO(alumnosInput);

		try {
			String url = iaServiceUrl + "/predict/aggregation";
			ResponseEntity<RiesgoProvinciaResponseDTO[]> response = restTemplate.postForEntity(url, requestBody,
					RiesgoProvinciaResponseDTO[].class);

			if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				return Arrays.asList(response.getBody());
			}

		} catch (Exception e) {
			System.err.println("Error al contactar el servicio de IA (/predict/aggregation): " + e.getMessage());
		}
		return new ArrayList<>();
	}

}
