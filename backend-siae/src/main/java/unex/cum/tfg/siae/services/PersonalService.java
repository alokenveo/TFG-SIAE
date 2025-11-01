package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import unex.cum.tfg.siae.model.Personal;
import unex.cum.tfg.siae.model.dto.PersonalDTO;

public interface PersonalService {
	Personal registrarPersonal(PersonalDTO dto);

	Page<Personal> obtenerPersonal(Pageable pageable, Long centroId, String search, String cargo);

	Personal obtenerPersonalPorId(Long id);

	Personal editarPersonal(Long id, PersonalDTO dto);

	void eliminarPersonal(Long id);

	List<Personal> obtenerPersonalPorCentro(Long centroId);

	List<String> obtenerCargos();
}