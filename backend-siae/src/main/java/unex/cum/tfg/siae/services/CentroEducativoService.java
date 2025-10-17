package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.CentroEducativo;

public interface CentroEducativoService {

	CentroEducativo registrarCentroEducativo(CentroEducativo centro);

	List<CentroEducativo> obtenerTodosLosCentros();

	CentroEducativo editarCentroEducativo(Long id, CentroEducativo centro);

	void eliminarCentroEducativo(Long id);
}
