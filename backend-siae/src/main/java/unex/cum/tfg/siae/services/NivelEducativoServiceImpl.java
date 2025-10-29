package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.NivelEducativo;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;
import unex.cum.tfg.siae.repository.NivelEducativoRepository;

@Service
public class NivelEducativoServiceImpl implements NivelEducativoService {

	private final NivelEducativoRepository nivEducativoRepository;

	private final CentroEducativoRepository centroEducativoRepository;

	public NivelEducativoServiceImpl(NivelEducativoRepository nivEducativoRepository,
			CentroEducativoRepository centroEducativoRepository) {
		this.nivEducativoRepository = nivEducativoRepository;
		this.centroEducativoRepository = centroEducativoRepository;
	}

	@Override
	public List<NivelEducativo> obtenerNiveles() {
		return nivEducativoRepository.findAll();
	}

	@Override
	@Transactional(readOnly = true)
	public List<NivelEducativo> obtenerNivelesPorCentro(Long centroId) {
		CentroEducativo centro = centroEducativoRepository.findById(centroId)
				.orElseThrow(() -> new RuntimeException("Centro no encontrado al buscar niveles: " + centroId));
		return centro.getNiveles();
	}

}
