package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import unex.cum.tfg.siae.model.CentroEducativo;

public interface CentroEducativoService {

	CentroEducativo registrarCentroEducativo(CentroEducativo centro);

	Page<CentroEducativo> obtenerCentros(Pageable pageable, String search, String tipo, String provincia);

	CentroEducativo editarCentroEducativo(Long id, CentroEducativo centro);

	void eliminarCentroEducativo(Long id);

	List<CentroEducativo> obtenerCentrosPorProvincia(String provincia);

	CentroEducativo obtenerCentroPorId(Long id);

	void actualizarNivelesCentro(Long centroId, List<Long> nivelIds);
}
