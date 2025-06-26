package unex.cum.tfg.siae.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Matricula {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private int anioAcademico;

	@ManyToOne
	private Alumno alumno;

	@ManyToOne
	private CentroEducativo centroEducativo;

	@ManyToOne
	private Curso curso;

	// Getters y setters
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

	public Alumno getAlumno() {
		return alumno;
	}

	public void setAlumno(Alumno alumno) {
		this.alumno = alumno;
	}

	public Curso getCurso() {
		return curso;
	}

	public void setCurso(Curso curso) {
		this.curso = curso;
	}

	public CentroEducativo getCentroEducativo() {
		return centroEducativo;
	}

	public void setCentroEducativo(CentroEducativo centroEducativo) {
		this.centroEducativo = centroEducativo;
	}

	@Override
	public String toString() {
		return "Matricula [id=" + id + ", anioAcademico=" + anioAcademico + ", alumno=" + alumno + ", centroEducativo="
				+ centroEducativo + ", curso=" + curso + "]";
	}

}
