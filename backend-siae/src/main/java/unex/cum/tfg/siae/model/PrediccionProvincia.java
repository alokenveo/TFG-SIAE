package unex.cum.tfg.siae.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "prediccion_provincia")
public class PrediccionProvincia {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "provincia")
	private String provincia;

	@Column(name = "anio_academico")
	private Integer anioAcademico;

	@Column(name = "tasa_suspensos_predicha")
	private Double tasaSuspensosPredicha;

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
	// ... similar para los otros

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getProvincia() {
		return provincia;
	}

	public void setProvincia(String provincia) {
		this.provincia = provincia;
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

	public LocalDateTime getFechaPrediccion() {
		return fechaPrediccion;
	}

	public void setFechaPrediccion(LocalDateTime fechaPrediccion) {
		this.fechaPrediccion = fechaPrediccion;
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
}
