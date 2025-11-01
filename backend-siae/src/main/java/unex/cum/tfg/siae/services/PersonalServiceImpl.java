package unex.cum.tfg.siae.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import unex.cum.tfg.siae.model.Personal;
import unex.cum.tfg.siae.model.dto.PersonalDTO;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;
import unex.cum.tfg.siae.repository.PersonalRepository;

@Service
public class PersonalServiceImpl implements PersonalService {

	private final PersonalRepository personalRepository;
	private final CentroEducativoRepository centroEducativoRepository;

	public PersonalServiceImpl(PersonalRepository personalRepository,
			CentroEducativoRepository centroEducativoRepository) {
		this.personalRepository = personalRepository;
		this.centroEducativoRepository = centroEducativoRepository;
	}

	private void validarDni(String dni) {
		if (dni == null || !dni.matches("^[0-9]{8}[A-Za-z]$")) {
			throw new IllegalArgumentException("Formato de DNI inválido.");
		}
	}

	@Override
	public Personal registrarPersonal(PersonalDTO dto) {
		validarDni(dto.getDni());

		if (personalRepository.existsByDni(dto.getDni())) {
			throw new IllegalArgumentException("El DNI ya está registrado.");
		}

		Personal personal = new Personal();
		personal.setDni(dto.getDni());
		personal.setNombre(dto.getNombre());
		personal.setApellidos(dto.getApellidos());
		personal.setCargo(dto.getCargo());

		if (dto.getCentroEducativoId() != null) {
			personal.setCentroEducativo(centroEducativoRepository.findById(dto.getCentroEducativoId()).orElseThrow(
					() -> new IllegalArgumentException("Centro educativo no encontrado con ID: " + dto.getCentroEducativoId())));
		}

		return personalRepository.save(personal);
	}

	@Override
	public Page<Personal> obtenerPersonal(Pageable pageable, Long centroId, String search, String cargo) {

		Specification<Personal> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (centroId != null) {
				predicates.add(cb.equal(root.get("centroEducativo").get("id"), centroId));
			}

			if (search != null && !search.isEmpty()) {
				String searchLower = "%" + search.toLowerCase() + "%";
				Predicate dniPred = cb.like(cb.lower(root.get("dni")), searchLower);
				Predicate nombrePred = cb.like(cb.lower(root.get("nombre")), searchLower);
				Predicate apellidosPred = cb.like(cb.lower(root.get("apellidos")), searchLower);
				predicates.add(cb.or(dniPred, nombrePred, apellidosPred));
			}

			if (cargo != null && !cargo.isEmpty() && !"TODOS".equals(cargo)) {
				predicates.add(cb.equal(root.get("cargo"), cargo));
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		if (pageable.getSort().isUnsorted()) {
			pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
					Sort.by("apellidos").ascending());
		}

		return personalRepository.findAll(spec, pageable);
	}

	@Override
	public Personal obtenerPersonalPorId(Long id) {
		return personalRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Personal no encontrado con ID: " + id));
	}

	@Override
	public Personal editarPersonal(Long id, PersonalDTO dto) {
		return personalRepository.findById(id).map(personal -> {
			personal.setNombre(dto.getNombre());
			personal.setApellidos(dto.getApellidos());
			personal.setCargo(dto.getCargo());

			if (!personal.getDni().equals(dto.getDni())) {
				validarDni(dto.getDni());

				if (personalRepository.existsByDniAndIdNot(dto.getDni(), id)) {
					throw new IllegalArgumentException("El nuevo DNI ya está registrado para otro personal.");
				}
				personal.setDni(dto.getDni());
			}

			if (dto.getCentroEducativoId() != null) {
				personal.setCentroEducativo(centroEducativoRepository.findById(dto.getCentroEducativoId())
						.orElseThrow(() -> new IllegalArgumentException(
								"Centro educativo no encontrado con ID: " + dto.getCentroEducativoId())));
			} else {
				personal.setCentroEducativo(null);
			}

			return personalRepository.save(personal);
		}).orElseThrow(() -> new IllegalArgumentException("Personal no encontrado con ID: " + id));
	}

	@Override
	public void eliminarPersonal(Long id) {
		personalRepository.deleteById(id);
	}

	@Override
	public List<Personal> obtenerPersonalPorCentro(Long centroId) {
		return personalRepository.findByCentroEducativoId(centroId);
	}

	@Override
	public List<String> obtenerCargos() {
		return personalRepository.findDistinctCargo();
	}
}
