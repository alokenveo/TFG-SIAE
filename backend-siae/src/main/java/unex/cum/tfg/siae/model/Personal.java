package unex.cum.tfg.siae.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Personal {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(unique = true, nullable = false, length = 9)
	private String dni;

	private String nombre;
	private String apellidos;
	private String cargo; // docente, administrativo, etc.

	@ManyToOne
	private CentroEducativo centroEducativo;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getDni() {
		return dni;
	}

	public void setDni(String dni) {
		this.dni = dni;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getApellidos() {
		return apellidos;
	}

	public void setApellidos(String apellidos) {
		this.apellidos = apellidos;
	}

	public String getCargo() {
		return cargo;
	}

	public void setCargo(String cargo) {
		this.cargo = cargo;
	}

	public CentroEducativo getCentroEducativo() {
		return centroEducativo;
	}

	public void setCentroEducativo(CentroEducativo centroEducativo) {
		this.centroEducativo = centroEducativo;
	}

	@Override
	public String toString() {
		return "Personal [id=" + id + ", dni=" + dni + ", nombre=" + nombre + ", apellidos=" + apellidos + ", cargo="
				+ cargo + "]";
	}
}
