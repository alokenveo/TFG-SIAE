package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.NivelEducativo;

public interface NivelEducativoService {

	List<NivelEducativo> obtenerNiveles();

	List<NivelEducativo> obtenerNivelesPorCentro(Long centroId);

}
