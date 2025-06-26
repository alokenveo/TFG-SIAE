package unex.cum.tfg.siae.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ADMIN")
public class Administrador extends Usuario {

	@Override
	public String getRol() {
		return "ADMIN";
	}

}
