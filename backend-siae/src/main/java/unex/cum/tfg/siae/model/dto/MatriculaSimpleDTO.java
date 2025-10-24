package unex.cum.tfg.siae.model.dto;

import unex.cum.tfg.siae.model.Matricula;

public class MatriculaSimpleDTO {
	private Long id;
	private int anioAcademico;
	private CursoSimpleDTO curso;
	private CentroSimpleDTO centroEducativo;

	// Constructor vacío
	public MatriculaSimpleDTO() {
	}

	// Constructor para mapeo fácil
	public MatriculaSimpleDTO(Matricula matricula) {
		this.id = matricula.getId();
		this.anioAcademico = matricula.getAnioAcademico();
		if (matricula.getCurso() != null) {
			this.curso = new CursoSimpleDTO(matricula.getCurso());
		}
		if (matricula.getCentroEducativo() != null) {
			this.centroEducativo = new CentroSimpleDTO(matricula.getCentroEducativo());
		}
	}

	// --- Getters y Setters ---
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

	public CursoSimpleDTO getCurso() {
		return curso;
	}

	public void setCurso(CursoSimpleDTO curso) {
		this.curso = curso;
	}

	public CentroSimpleDTO getCentroEducativo() {
		return centroEducativo;
	}

	public void setCentroEducativo(CentroSimpleDTO centroEducativo) {
		this.centroEducativo = centroEducativo;
	}
}