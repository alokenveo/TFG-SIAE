package unex.cum.tfg.siae.model.dto;

// Debe coincidir con AlumnoEnRiesgoResponse de Python
public record AlumnoEnRiesgoResponseDTO(
        Long alumno_id,
        double probabilidad_riesgo,
        String motivo_principal
) {}