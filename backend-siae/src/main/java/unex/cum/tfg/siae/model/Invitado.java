package unex.cum.tfg.siae.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("INVITADO")
public class Invitado extends Usuario {

	@Override
	public String getRol() {
		return "INVITADO";
	}

}
