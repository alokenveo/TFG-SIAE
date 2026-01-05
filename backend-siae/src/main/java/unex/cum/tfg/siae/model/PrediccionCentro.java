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
    @UniqueConstraint(columnNames = {"centro_id", "anio_academico"})
})
public class PrediccionCentro {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "centro_id")
    private CentroEducativo centro;

    @Column(name = "anio_academico") private Integer anioAcademico;
    @Column(name = "tasa_suspensos_media") private Double tasaSuspensosMedia;
    @Column(name = "alumnos_riesgo_alto") private Integer alumnosRiesgoAlto;
    @Column(name = "ranking_riesgo") private Integer rankingRiesgo;
    @Column(name = "fecha_prediccion") private LocalDateTime fechaPrediccion;
    
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
	public Double getTasaSuspensosMedia() {
		return tasaSuspensosMedia;
	}
	public void setTasaSuspensosMedia(Double tasaSuspensosMedia) {
		this.tasaSuspensosMedia = tasaSuspensosMedia;
	}
	public Integer getAlumnosRiesgoAlto() {
		return alumnosRiesgoAlto;
	}
	public void setAlumnosRiesgoAlto(Integer alumnosRiesgoAlto) {
		this.alumnosRiesgoAlto = alumnosRiesgoAlto;
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
