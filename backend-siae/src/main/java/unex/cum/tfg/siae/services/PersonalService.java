package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.Personal;
import unex.cum.tfg.siae.model.dto.PersonalDTO;

public interface PersonalService {
	Personal registrarPersonal(PersonalDTO dto);

	List<Personal> obtenerPersonal();

	Personal obtenerPersonalPorId(Long id);

	Personal editarPersonal(Long id, PersonalDTO dto);

	void eliminarPersonal(Long id);

	List<Personal> obtenerPersonalPorCentro(Long centroId);
}
