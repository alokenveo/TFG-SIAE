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
	@Column(name = "tasa_suspensos_media")
	private Double tasaSuspensosMedia;
	@Column(name = "fecha_prediccion")
	private LocalDateTime fechaPrediccion;
	
	
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
	public Double getTasaSuspensosMedia() {
		return tasaSuspensosMedia;
	}
	public void setTasaSuspensosMedia(Double tasaSuspensosMedia) {
		this.tasaSuspensosMedia = tasaSuspensosMedia;
	}
	public LocalDateTime getFechaPrediccion() {
		return fechaPrediccion;
	}
	public void setFechaPrediccion(LocalDateTime fechaPrediccion) {
		this.fechaPrediccion = fechaPrediccion;
	}
}
