package unex.cum.tfg.siae.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prediccion_alumno", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "alumno_id", "anio_academico" }) })
public class PrediccionAlumno {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "alumno_id", nullable = false)
	private Alumno alumno;

	@Column(name = "anio_academico", nullable = false)
	private Integer anioAcademico;

	@Column(name = "prob_repetir")
	private Double probRepetir;
	
	@Column(name = "prob_abandono")
	private Double probAbandono;

	@Column(name = "n_suspensos_predichos")
	private Integer nSuspensosPredichos;

	@Column(name = "detalle_json", columnDefinition = "json")
	private String detalleJson;

	@Column(name = "fecha_prediccion")
	private LocalDateTime fechaPrediccion;

	// ================================
	// CONSTRUCTORES
	// ================================
	public PrediccionAlumno() {
	}

	public PrediccionAlumno(Alumno alumno, Integer anioAcademico, Double probRepetir, Integer nSuspensosPredichos,
			String detalleJson) {
		this.alumno = alumno;
		this.anioAcademico = anioAcademico;
		this.probRepetir = probRepetir;
		this.nSuspensosPredichos = nSuspensosPredichos;
		this.detalleJson = detalleJson;
		this.fechaPrediccion = LocalDateTime.now();
	}

	// ================================
	// GETTERS Y SETTERS
	// ================================
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Alumno getAlumno() {
		return alumno;
	}

	public void setAlumno(Alumno alumno) {
		this.alumno = alumno;
	}

	public Integer getAnioAcademico() {
		return anioAcademico;
	}

	public void setAnioAcademico(Integer anioAcademico) {
		this.anioAcademico = anioAcademico;
	}

	public Double getProbRepetir() {
		return probRepetir;
	}

	public void setProbRepetir(Double probRepetir) {
		this.probRepetir = probRepetir;
	}

	public Double getProbAbandono() {
		return probAbandono;
	}

	public void setProbAbandono(Double probAbandono) {
		this.probAbandono = probAbandono;
	}

	public Integer getnSuspensosPredichos() {
		return nSuspensosPredichos;
	}

	public void setnSuspensosPredichos(Integer nSuspensosPredichos) {
		this.nSuspensosPredichos = nSuspensosPredichos;
	}

	public String getDetalleJson() {
		return detalleJson;
	}

	public void setDetalleJson(String detalleJson) {
		this.detalleJson = detalleJson;
	}

	public LocalDateTime getFechaPrediccion() {
		return fechaPrediccion;
	}

	public void setFechaPrediccion(LocalDateTime fechaPrediccion) {
		this.fechaPrediccion = fechaPrediccion;
	}

	@Override
	public String toString() {
		return "PrediccionAlumno [id=" + id + ", alumno=" + alumno + ", anioAcademico=" + anioAcademico
				+ ", probRepetir=" + probRepetir + ", probAbandono=" + probAbandono + ", nSuspensosPredichos="
				+ nSuspensosPredichos + ", detalleJson=" + detalleJson + ", fechaPrediccion=" + fechaPrediccion + "]";
	}

	
}