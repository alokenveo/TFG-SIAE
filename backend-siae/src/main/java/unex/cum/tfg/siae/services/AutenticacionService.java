package unex.cum.tfg.siae.services;

import unex.cum.tfg.siae.model.Autenticacion;
import unex.cum.tfg.siae.model.Usuario;

public interface AutenticacionService {
	Usuario login(Autenticacion user);
}
