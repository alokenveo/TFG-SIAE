package unex.cum.tfg.siae.model;

import java.util.List;

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
	private NivelEducativo nivel;
	
	@ManyToOne
    private CentroEducativo centro;

	@OneToMany(mappedBy = "curso")
	private List<Asignatura> asignaturas;
	
	public Curso(int orden, NivelEducativo nivel, CentroEducativo centro) {
	    this.orden = orden;
	    this.nivel = nivel;
	    this.centro = centro;
	    this.nombre = orden + "º de " + nivel.getNombre();
	}

}
