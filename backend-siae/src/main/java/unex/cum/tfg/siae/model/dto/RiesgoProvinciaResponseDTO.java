package unex.cum.tfg.siae.model.dto;

public record RiesgoProvinciaResponseDTO(
    String provincia,
    double porcentaje_riesgo,
    int total_alumnos,
    int total_en_riesgo
) {}