package unex.cum.tfg.siae.model.dto;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import unex.cum.tfg.siae.model.Alumno;

public class AlumnoDetalleDTO {
	private Long id;
	private String nombre;
	private String apellidos;
	private LocalDate fechaNacimiento;
	private String sexo;
	private List<MatriculaSimpleDTO> matriculas;

	public AlumnoDetalleDTO() {
	}

	public AlumnoDetalleDTO(Alumno alumno) {
		this.id = alumno.getId();
		this.nombre = alumno.getNombre();
		this.apellidos = alumno.getApellidos();
		this.fechaNacimiento = alumno.getFechaNacimiento();
		this.sexo = (alumno.getSexo() != null) ? alumno.getSexo().name() : null;

		if (alumno.getMatriculas() != null) {
			this.matriculas = alumno.getMatriculas().stream().map(MatriculaSimpleDTO::new).collect(Collectors.toList());
		} else {
			this.matriculas = Collections.emptyList();
		}
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

	public String getApellidos() {
		return apellidos;
	}

	public void setApellidos(String apellidos) {
		this.apellidos = apellidos;
	}

	public LocalDate getFechaNacimiento() {
		return fechaNacimiento;
	}

	public void setFechaNacimiento(LocalDate fechaNacimiento) {
		this.fechaNacimiento = fechaNacimiento;
	}

	public String getSexo() {
		return sexo;
	}

	public void setSexo(String sexo) {
		this.sexo = sexo;
	}

	public List<MatriculaSimpleDTO> getMatriculas() {
		return matriculas;
	}

	public void setMatriculas(List<MatriculaSimpleDTO> matriculas) {
		this.matriculas = matriculas;
	}
}