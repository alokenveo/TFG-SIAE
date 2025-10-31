package unex.cum.tfg.siae.model.dto;

import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

public record AlumnoInputDTO(Long alumno_id,

		@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") LocalDate fecha_nacimiento,

		int curso_orden, Long nivel_id, List<Double> notas_evaluacion) {
}