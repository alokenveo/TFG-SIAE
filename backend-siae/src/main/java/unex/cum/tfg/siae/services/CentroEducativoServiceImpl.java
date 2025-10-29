package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.NivelEducativo;
import unex.cum.tfg.siae.model.Provincia;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;
import unex.cum.tfg.siae.repository.NivelEducativoRepository;

@Service
public class CentroEducativoServiceImpl implements CentroEducativoService {

	private final CentroEducativoRepository centroEducativoRepository;

	private final NivelEducativoRepository nivelEducativoRepository;

	public CentroEducativoServiceImpl(CentroEducativoRepository centroEducativoRepository,
			NivelEducativoRepository nivelEducativoRepository) {
		this.centroEducativoRepository = centroEducativoRepository;
		this.nivelEducativoRepository = nivelEducativoRepository;
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

	@Override
	@Transactional(readOnly = true)
	public CentroEducativo obtenerCentroPorId(Long id) {
		CentroEducativo centro = centroEducativoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Centro no encontrado con id: " + id));
		return centro;
	}

	@Override
	@Transactional
	public void actualizarNivelesCentro(Long centroId, List<Long> nivelIds) {
		CentroEducativo centro = centroEducativoRepository.findById(centroId)
				.orElseThrow(() -> new RuntimeException("Centro no encontrado con id: " + centroId));

		List<NivelEducativo> nuevosNiveles = nivelEducativoRepository.findAllById(nivelIds);
		if (nuevosNiveles.size() != nivelIds.size()) {
			List<Long> idsEncontrados = nuevosNiveles.stream().map(NivelEducativo::getId).toList();
			List<Long> idsNoEncontrados = nivelIds.stream().filter(id -> !idsEncontrados.contains(id)).toList();
			throw new RuntimeException("Nivel(es) educativo(s) no encontrado(s) con ID(s): " + idsNoEncontrados);
		}
		centro.setNiveles(nuevosNiveles);

		centroEducativoRepository.save(centro);
	}

}
