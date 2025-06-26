package unex.cum.tfg.siae.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Alumno {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nombre;
	private String apellidos;
	private LocalDate fechaNacimiento;
	
	@Enumerated(EnumType.STRING)
	private Sexo sexo;

	@ManyToOne
	private CentroEducativo centroEducativo;
	
}
