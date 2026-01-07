package unex.cum.tfg.siae.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "prediccion_asignatura")
public class PrediccionAsignatura {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "asignatura_id")
	private Asignatura asignatura;

	@Column(name = "anio_academico")
	private Integer anioAcademico;

	@Column(name = "tasa_suspensos_predicha")
	private Double tasaSuspensosPredicha;

	@Column(name = "dificultad_percibida")
	private String dificultadPercibida;

	@Column(name = "fecha_prediccion")
	private LocalDateTime fechaPrediccion;

	@Column(name = "nivel_id")
	private Integer nivelId;

	@Column(name = "curso_orden")
	private Integer cursoOrden;

	@Column(name = "n_alumnos")
	private Integer nAlumnos;

	// Getters/setters
	public Integer getNivelId() {
		return nivelId;
	}

	public void setNivelId(Integer nivelId) {
		this.nivelId = nivelId;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Asignatura getAsignatura() {
		return asignatura;
	}

	public void setAsignatura(Asignatura asignatura) {
		this.asignatura = asignatura;
	}

	public Integer getAnioAcademico() {
		return anioAcademico;
	}

	public void setAnioAcademico(Integer anioAcademico) {
		this.anioAcademico = anioAcademico;
	}

	public Double getTasaSuspensosPredicha() {
		return tasaSuspensosPredicha;
	}

	public void setTasaSuspensosPredicha(Double tasaSuspensosPredicha) {
		this.tasaSuspensosPredicha = tasaSuspensosPredicha;
	}

	public String getDificultadPercibida() {
		return dificultadPercibida;
	}

	public void setDificultadPercibida(String dificultadPercibida) {
		this.dificultadPercibida = dificultadPercibida;
	}

	public LocalDateTime getFechaPrediccion() {
		return fechaPrediccion;
	}

	public void setFechaPrediccion(LocalDateTime fechaPrediccion) {
		this.fechaPrediccion = fechaPrediccion;
	}

	public Integer getCursoOrden() {
		return cursoOrden;
	}

	public void setCursoOrden(Integer cursoOrden) {
		this.cursoOrden = cursoOrden;
	}

	public Integer getNAlumnos() {
		return nAlumnos;
	}

	public void setNAlumnos(Integer nAlumnos) {
		this.nAlumnos = nAlumnos;
	}
}
