package unex.cum.tfg.siae.model;

public class NotaDTO {

	private Long alumnoId;
	private Long asignaturaId;
	private Long cursoId;
	private int anioAcademico;
	private Double calificacion;

	public Long getAlumnoId() {
		return alumnoId;
	}

	public void setAlumnoId(Long alumnoId) {
		this.alumnoId = alumnoId;
	}

	public Long getAsignaturaId() {
		return asignaturaId;
	}

	public void setAsignaturaId(Long asignaturaId) {
		this.asignaturaId = asignaturaId;
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

	public Double getCalificacion() {
		return calificacion;
	}

	public void setCalificacion(Double calificacion) {
		this.calificacion = calificacion;
	}
}
