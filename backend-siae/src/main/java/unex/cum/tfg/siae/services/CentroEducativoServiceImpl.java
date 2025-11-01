package unex.cum.tfg.siae.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.NivelEducativo;
import unex.cum.tfg.siae.model.Provincia;
import unex.cum.tfg.siae.model.TipoCentro;
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
	@Transactional(readOnly = true)
	public Page<CentroEducativo> obtenerCentros(Pageable pageable, String search, String tipo, String provincia) {

		Specification<CentroEducativo> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (search != null && !search.isEmpty()) {
				String searchLower = "%" + search.toLowerCase() + "%";
				Predicate nombrePred = cb.like(cb.lower(root.get("nombre")), searchLower);
				Predicate tipoPred = cb.like(cb.lower(root.get("tipo").as(String.class)), searchLower);
				Predicate provPred = cb.like(cb.lower(root.get("provincia").as(String.class)), searchLower);
				predicates.add(cb.or(nombrePred, tipoPred, provPred));
			}

			if (tipo != null && !tipo.isEmpty() && !"TODOS".equals(tipo)) {
				try {
					predicates.add(cb.equal(root.get("tipo"), TipoCentro.valueOf(tipo.toUpperCase())));
				} catch (IllegalArgumentException e) {
				}
			}

			if (provincia != null && !provincia.isEmpty() && !"TODOS".equals(provincia)) {
				try {
					predicates.add(cb.equal(root.get("provincia"), Provincia.valueOf(provincia.toUpperCase())));
				} catch (IllegalArgumentException e) {
				}
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		if (pageable.getSort().isUnsorted()) {
			pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("nombre").ascending());
		}

		return centroEducativoRepository.findAll(spec, pageable);
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
