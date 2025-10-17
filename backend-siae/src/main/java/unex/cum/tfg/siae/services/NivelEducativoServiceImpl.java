package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.NivelEducativo;
import unex.cum.tfg.siae.repository.NivelEducativoRepository;

@Service
public class NivelEducativoServiceImpl implements NivelEducativoService {

	private final NivelEducativoRepository nivEducativoRepository;

	public NivelEducativoServiceImpl(NivelEducativoRepository nivEducativoRepository) {
		this.nivEducativoRepository = nivEducativoRepository;
	}

	@Override
	public List<NivelEducativo> obtenerNiveles() {
		return nivEducativoRepository.findAll();
	}

}
