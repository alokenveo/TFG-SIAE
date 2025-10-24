package unex.cum.tfg.siae.model.dto;

public class MatriculaDTO {

	private Long alumnoId;
	private Long centroEducativoId;
	private Long cursoId;
	private int anioAcademico;

	// Getters y Setters
	public Long getAlumnoId() {
		return alumnoId;
	}

	public void setAlumnoId(Long alumnoId) {
		this.alumnoId = alumnoId;
	}

	public Long getCentroEducativoId() {
		return centroEducativoId;
	}

	public void setCentroEducativoId(Long centroEducativoId) {
		this.centroEducativoId = centroEducativoId;
	}

	public Long getCursoId() {
		return cursoId;
	}

	public void setCursoId(Long cursoId) {
		this.cursoId = cursoId;
	}

	public int getAnioAcademico() {
		return anioAcademico;
	}

	public void setAnioAcademico(int anioAcademico) {
		this.anioAcademico = anioAcademico;
	}
}
