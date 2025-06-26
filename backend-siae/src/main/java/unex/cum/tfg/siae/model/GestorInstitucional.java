package unex.cum.tfg.siae.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
@DiscriminatorValue("GESTOR")
public class GestorInstitucional extends Usuario {
	
	@ManyToOne
	private CentroEducativo centro;

	@Override
	public String getRol() {
		return "GESTOR";
	}

}
