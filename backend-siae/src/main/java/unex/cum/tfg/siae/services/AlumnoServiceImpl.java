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
import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.model.Sexo;
import unex.cum.tfg.siae.model.dto.AlumnoDetalleDTO;
import unex.cum.tfg.siae.repository.AlumnoRepository;

@Service
public class AlumnoServiceImpl implements AlumnoService {

	private final AlumnoRepository alumnoRepository;

	public AlumnoServiceImpl(AlumnoRepository alumnoRepository) {
		this.alumnoRepository = alumnoRepository;
	}

	@Override
	public Alumno registarAlumno(Alumno alumno) {
		if (!isValidDniFormat(alumno.getDni())) {
			throw new IllegalArgumentException("Formato de DNI inválido.");
		}
		if (alumnoRepository.existsByDni(alumno.getDni())) {
			throw new IllegalArgumentException("El DNI ya está registrado.");
		}
		return alumnoRepository.save(alumno);
	}

	private boolean isValidDniFormat(String dni) {
		return dni != null && dni.matches("^[0-9]{8}[A-Za-z]$");
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Alumno> obtenerAlumnos(Pageable pageable, Long centroId, String search, String sexo) {

		// Specification es una forma de construir consultas dinámicas
		Specification<Alumno> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (centroId != null) {
				predicates.add(cb.equal(root.get("centroEducativo").get("id"), centroId));
			}

			if (search != null && !search.isEmpty()) {
				String searchLower = "%" + search.toLowerCase() + "%";
				Predicate dniPredicate = cb.like(cb.lower(root.get("dni")), searchLower);
				Predicate nombrePredicate = cb.like(cb.lower(root.get("nombre")), searchLower);
				Predicate apellidosPredicate = cb.like(cb.lower(root.get("apellidos")), searchLower);
				predicates.add(cb.or(dniPredicate, nombrePredicate, apellidosPredicate));
			}

			if (sexo != null && !sexo.isEmpty() && !"TODOS".equals(sexo)) {
				try {
					predicates.add(cb.equal(root.get("sexo"), Sexo.valueOf(sexo.toUpperCase())));
				} catch (IllegalArgumentException e) {
				}
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		if (pageable.getSort().isUnsorted()) {
			pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
					Sort.by("apellidos").ascending());
		}

		return alumnoRepository.findAll(spec, pageable);
	}

	@Override
	public Alumno editarAlumno(Long id, Alumno alumnoDetails) {
		return alumnoRepository.findById(id).map(alumno -> {
			alumno.setNombre(alumnoDetails.getNombre());
			alumno.setApellidos(alumnoDetails.getApellidos());
			alumno.setFechaNacimiento(alumnoDetails.getFechaNacimiento());
			alumno.setSexo(alumnoDetails.getSexo());
			if (!alumno.getDni().equals(alumnoDetails.getDni())) {
				if (!isValidDniFormat(alumnoDetails.getDni())) {
					throw new IllegalArgumentException("Formato de DNI inválido.");
				}
				if (alumnoRepository.existsByDniAndIdNot(alumnoDetails.getDni(), id)) {
					throw new IllegalArgumentException("El nuevo DNI ya está registrado para otro alumno.");
				}
				alumno.setDni(alumnoDetails.getDni());
			}
			return alumnoRepository.save(alumno);
		}).orElse(null);
	}

	@Override
	public void eliminarAlumno(Long id) {
		alumnoRepository.deleteById(id);
	}

	@Override
	@Transactional(readOnly = true)
	public AlumnoDetalleDTO obtenerAlumnoPorId(Long id) {
		Alumno alumno = alumnoRepository.findById(id).orElse(null);
		if (alumno.getMatriculas() != null) {
			alumno.getMatriculas().size();

			for (Matricula matricula : alumno.getMatriculas()) {
				if (matricula.getCurso() != null) {
					matricula.getCurso().getNombre();
				}
				if (matricula.getCentroEducativo() != null) {
					matricula.getCentroEducativo().getNombre();
				}
			}
		}
		return new AlumnoDetalleDTO(alumno);
	}

	@Override
	public AlumnoDetalleDTO obtenerAlumnoPorDni(String dni) {
		Alumno alumno = alumnoRepository.findByDni(dni).orElse(null);
		return new AlumnoDetalleDTO(alumno);
	}

}
