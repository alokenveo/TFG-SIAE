package unex.cum.tfg.siae.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class CentroEducativo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nombre;
	private String direccion;

	@Enumerated(EnumType.STRING)
	private Provincia provincia;

	@Enumerated(EnumType.STRING)
	private TipoCentro tipo;

	@ManyToMany
	@JoinTable(name = "centro_nivel", joinColumns = @JoinColumn(name = "centro_id"), inverseJoinColumns = @JoinColumn(name = "nivel_id"))
	@JsonIgnore
	private List<NivelEducativo> niveles;

	@OneToMany(mappedBy = "centroEducativo")
	@JsonIgnore
	private List<Alumno> alumnos;

	@OneToMany(mappedBy = "centroEducativo")
	@JsonIgnore
	private List<Personal> personal;

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

	public String getDireccion() {
		return direccion;
	}

	public void setDireccion(String direccion) {
		this.direccion = direccion;
	}

	public Provincia getProvincia() {
		return provincia;
	}

	public void setProvincia(Provincia provincia) {
		this.provincia = provincia;
	}

	public TipoCentro getTipo() {
		return tipo;
	}

	public void setTipo(TipoCentro tipo) {
		this.tipo = tipo;
	}

	public List<NivelEducativo> getNiveles() {
		return niveles;
	}

	public void setNiveles(List<NivelEducativo> niveles) {
		this.niveles = niveles;
	}

	public List<Alumno> getAlumnos() {
		return alumnos;
	}

	public void setAlumnos(List<Alumno> alumnos) {
		this.alumnos = alumnos;
	}

	public List<Personal> getPersonal() {
		return personal;
	}

	public void setPersonal(List<Personal> personal) {
		this.personal = personal;
	}

	@Override
	public String toString() {
		return "CentroEducativo [nombre=" + nombre + ", direccion=" + direccion + ", provincia=" + provincia + ", tipo="
				+ tipo + "]";
	}
}
