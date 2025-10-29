package unex.cum.tfg.siae.model.dto;

public class PersonalDTO {

	private String dni;
	private String nombre;
	private String apellidos;
	private String cargo;
	private Long centroEducativoId;

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

	public Long getCentroEducativoId() {
		return centroEducativoId;
	}

	public void setCentroEducativoId(Long centroId) {
		this.centroEducativoId = centroId;
	}
}
