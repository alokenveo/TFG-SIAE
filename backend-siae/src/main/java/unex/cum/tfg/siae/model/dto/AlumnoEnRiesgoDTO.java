package unex.cum.tfg.siae.model.dto;

import unex.cum.tfg.siae.model.Alumno;

public class AlumnoEnRiesgoDTO {

	private Alumno alumno;
	private double probabilidadRiesgo;
	private String motivoPrincipal;

	public AlumnoEnRiesgoDTO(Alumno alumno, double probabilidadRiesgo, String motivoPrincipal) {
		this.alumno = alumno;
		this.probabilidadRiesgo = probabilidadRiesgo;
		this.motivoPrincipal = motivoPrincipal;
	}

	public Alumno getAlumno() {
		return alumno;
	}

	public void setAlumno(Alumno alumno) {
		this.alumno = alumno;
	}

	public double getProbabilidadRiesgo() {
		return probabilidadRiesgo;
	}

	public void setProbabilidadRiesgo(double probabilidadRiesgo) {
		this.probabilidadRiesgo = probabilidadRiesgo;
	}

	public String getMotivoPrincipal() {
		return motivoPrincipal;
	}

	public void setMotivoPrincipal(String motivoPrincipal) {
		this.motivoPrincipal = motivoPrincipal;
	}

}
