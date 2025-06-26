package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;

@Service
public class CentroEducativoServiceImpl implements CentroEducativoService {
	
	private final CentroEducativoRepository centroEducativoRepository;
	
	public CentroEducativoServiceImpl(CentroEducativoRepository centroEducativoRepository) {
		this.centroEducativoRepository=centroEducativoRepository;
	}

	@Override
	public CentroEducativo registrarCentroEducativo(CentroEducativo centro) {
		return centroEducativoRepository.save(centro);
	}

	@Override
	public List<CentroEducativo> obtenerTodosLosCentros() {
		return centroEducativoRepository.findAll();
	}

}
