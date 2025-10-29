package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.CentroEducativo;

public interface CentroEducativoService {

	CentroEducativo registrarCentroEducativo(CentroEducativo centro);

	List<CentroEducativo> obtenerTodosLosCentros();

	CentroEducativo editarCentroEducativo(Long id, CentroEducativo centro);

	void eliminarCentroEducativo(Long id);

	List<CentroEducativo> obtenerCentrosPorProvincia(String provincia);

	CentroEducativo obtenerCentroPorId(Long id);

	void actualizarNivelesCentro(Long centroId, List<Long> nivelIds);
}
