package unex.cum.tfg.siae.model.dto;

import unex.cum.tfg.siae.model.CentroEducativo;

public class CentroSimpleDTO {
	private Long id;
	private String nombre;

	public CentroSimpleDTO() {
	}

	public CentroSimpleDTO(CentroEducativo centro) {
		this.id = centro.getId();
		this.nombre = centro.getNombre();
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