package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.Provincia;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;

@Service
public class CentroEducativoServiceImpl implements CentroEducativoService {

	private final CentroEducativoRepository centroEducativoRepository;

	public CentroEducativoServiceImpl(CentroEducativoRepository centroEducativoRepository) {
		this.centroEducativoRepository = centroEducativoRepository;
	}

	@Override
	public CentroEducativo registrarCentroEducativo(CentroEducativo centro) {
		return centroEducativoRepository.save(centro);
	}

	@Override
	public List<CentroEducativo> obtenerTodosLosCentros() {
		return centroEducativoRepository.findAll();
	}

	@Override
	public CentroEducativo editarCentroEducativo(Long id, CentroEducativo centroDetails) {
		return centroEducativoRepository.findById(id).map(centro -> {
			centro.setNombre(centroDetails.getNombre());
			centro.setDireccion(centroDetails.getDireccion());
			centro.setProvincia(centroDetails.getProvincia());
			centro.setTipo(centroDetails.getTipo());
			return centroEducativoRepository.save(centro);
		}).orElse(null);
	}

	@Override
	public void eliminarCentroEducativo(Long id) {
		centroEducativoRepository.deleteById(id);
	}

	@Override
	public List<CentroEducativo> obtenerCentrosPorProvincia(String provincia) {
		Provincia provinciaEnum = Provincia.valueOf(provincia.toUpperCase());
		return centroEducativoRepository.findByProvincia(provinciaEnum);
	}

}
