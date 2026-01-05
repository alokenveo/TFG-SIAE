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
}
