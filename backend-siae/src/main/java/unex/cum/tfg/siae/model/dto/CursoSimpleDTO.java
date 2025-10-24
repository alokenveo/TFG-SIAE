package unex.cum.tfg.siae.model.dto;

import unex.cum.tfg.siae.model.Curso;

public class CursoSimpleDTO {
	private Long id;
	private String nombre;

	public CursoSimpleDTO() {
	}

	public CursoSimpleDTO(Curso curso) {
		this.id = curso.getId();
		this.nombre = curso.getNombre();
	}

	// --- Getters y Setters ---
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}
}