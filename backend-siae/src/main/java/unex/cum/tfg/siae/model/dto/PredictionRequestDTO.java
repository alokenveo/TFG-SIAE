package unex.cum.tfg.siae.model.dto;

import java.util.List;

// Debe coincidir con PredictionRequest de Python
public record PredictionRequestDTO(
        List<AlumnoInputDTO> alumnos_data
) {}