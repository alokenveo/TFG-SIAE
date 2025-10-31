package unex.cum.tfg.siae.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Nota {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private int anioAcademico;

	private Double calificacion;

	private String evaluacion;

	@ManyToOne
	private Alumno alumno;

	@ManyToOne
	private Asignatura asignatura;

	@ManyToOne
	private Curso curso;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public Alumno getAlumno() {
		return alumno;
	}

	public void setAlumno(Alumno alumno) {
		this.alumno = alumno;
	}

	public Asignatura getAsignatura() {
		return asignatura;
	}

	public void setAsignatura(Asignatura asignatura) {
		this.asignatura = asignatura;
	}

	public Curso getCurso() {
		return curso;
	}

	public void setCurso(Curso curso) {
		this.curso = curso;
	}

	public String getEvaluacion() {
		return evaluacion;
	}

	public void setEvaluacion(String evaluacion) {
		this.evaluacion = evaluacion;
	}

	@Override
	public String toString() {
		return "Nota [alumno=" + alumno + ", asignatura=" + asignatura + ", calificacion=" + calificacion
				+ ", anioAcademico=" + anioAcademico + "]";
	}
}
