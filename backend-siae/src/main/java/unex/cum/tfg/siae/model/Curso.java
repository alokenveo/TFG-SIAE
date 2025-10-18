package unex.cum.tfg.siae.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Curso {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private int orden;
	private String nombre;

	@ManyToOne
	@JsonBackReference
	private NivelEducativo nivel;

	@OneToMany(mappedBy = "curso")
	@JsonManagedReference
	private List<Asignatura> asignaturas;

	public Curso() {
	}

	public Curso(int orden, NivelEducativo nivel, CentroEducativo centro) {
		this.orden = orden;
		this.nivel = nivel;
		this.nombre = orden + "º de " + nivel.getNombre();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public int getOrden() {
		return orden;
	}

	public void setOrden(int orden) {
		this.orden = orden;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public NivelEducativo getNivel() {
		return nivel;
	}

	public void setNivel(NivelEducativo nivel) {
		this.nivel = nivel;
	}

	public List<Asignatura> getAsignaturas() {
		return asignaturas;
	}

	public void setAsignaturas(List<Asignatura> asignaturas) {
		this.asignaturas = asignaturas;
	}

	@Override
	public String toString() {
		return "Curso [nombre=" + nombre + ", orden=" + orden + ", nivel=" + nivel + ", asignaturas=" + asignaturas
				+ "]";
	}

}
