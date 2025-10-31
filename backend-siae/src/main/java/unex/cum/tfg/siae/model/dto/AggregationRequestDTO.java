package unex.cum.tfg.siae.model.dto;

import java.util.List;

public record AggregationRequestDTO(
    List<AlumnoInputAgregadoDTO> alumnos_data
) {}