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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "prediccion_centro", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "centro_id", "anio_academico" }) })
public class PrediccionCentro {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "centro_id")
	private CentroEducativo centro;

	@Column(name = "anio_academico")
	private Integer anioAcademico;

	@Column(name = "tasa_suspensos_predicha")
	private Double tasaSuspensosPredicha;

	@Column(name = "ranking_riesgo")
	private Integer rankingRiesgo;

	@Column(name = "fecha_prediccion")
	private LocalDateTime fechaPrediccion;

	@Column(name = "nota_media")
	private Double notaMedia;

	@Column(name = "num_alumnos")
	private Integer numAlumnos;

	@Column(name = "impacto_ratio")
	private Double impactoRatio;

	@Column(name = "tasa_si_10_docentes_mas")
	private Double tasaSi10DocentesMas;

	@Column(name = "json_tendencias", columnDefinition = "json")
	private String jsonTendencias;

	@Column(name = "json_disparidades", columnDefinition = "json")
	private String jsonDisparidades;

	// Añade getters/setters para estos
	public Double getNotaMedia() {
		return notaMedia;
	}

	public void setNotaMedia(Double notaMedia) {
		this.notaMedia = notaMedia;
	}

	public Integer getNumAlumnos() {
		return numAlumnos;
	}

	public void setNumAlumnos(Integer numAlumnos) {
		this.numAlumnos = numAlumnos;
	}

	public Double getImpactoRatio() {
		return impactoRatio;
	}

	public void setImpactoRatio(Double impactoRatio) {
		this.impactoRatio = impactoRatio;
	}

	public Double getTasaSi10DocentesMas() {
		return tasaSi10DocentesMas;
	}

	public void setTasaSi10DocentesMas(Double tasaSi10DocentesMas) {
		this.tasaSi10DocentesMas = tasaSi10DocentesMas;
	}

	public String getJsonTendencias() {
		return jsonTendencias;
	}

	public void setJsonTendencias(String jsonTendencias) {
		this.jsonTendencias = jsonTendencias;
	}

	public String getJsonDisparidades() {
		return jsonDisparidades;
	}

	public void setJsonDisparidades(String jsonDisparidades) {
		this.jsonDisparidades = jsonDisparidades;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public CentroEducativo getCentro() {
		return centro;
	}

	public void setCentro(CentroEducativo centro) {
		this.centro = centro;
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

	public void setTasaSuspensosMedia(Double tasaSuspensosPredicha) {
		this.tasaSuspensosPredicha = tasaSuspensosPredicha;
	}

	public Integer getRankingRiesgo() {
		return rankingRiesgo;
	}

	public void setRankingRiesgo(Integer rankingRiesgo) {
		this.rankingRiesgo = rankingRiesgo;
	}

	public LocalDateTime getFechaPrediccion() {
		return fechaPrediccion;
	}

	public void setFechaPrediccion(LocalDateTime fechaPrediccion) {
		this.fechaPrediccion = fechaPrediccion;
	}
}
