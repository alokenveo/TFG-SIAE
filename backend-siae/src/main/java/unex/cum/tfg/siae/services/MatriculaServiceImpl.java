package unex.cum.tfg.siae.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.CentroEducativo;
import unex.cum.tfg.siae.model.Curso;
import unex.cum.tfg.siae.model.Matricula;
import unex.cum.tfg.siae.model.dto.MatriculaDTO;
import unex.cum.tfg.siae.repository.AlumnoRepository;
import unex.cum.tfg.siae.repository.CentroEducativoRepository;
import unex.cum.tfg.siae.repository.CursoRepository;
import unex.cum.tfg.siae.repository.MatriculaRepository;

@Service
public class MatriculaServiceImpl implements MatriculaService {

	private final MatriculaRepository matriculaRepository;

	private final AlumnoRepository alumnoRepository;

	private final CentroEducativoRepository centroEducativoRepository;

	private final CursoRepository cursoRepository;

	public MatriculaServiceImpl(MatriculaRepository matriculaRepository, AlumnoRepository alumnoRepository,
			CentroEducativoRepository centroEducativoRepository, CursoRepository cursoRepository) {
		this.matriculaRepository = matriculaRepository;
		this.alumnoRepository = alumnoRepository;
		this.centroEducativoRepository = centroEducativoRepository;
		this.cursoRepository = cursoRepository;
	}

	@Override
	public Matricula registrarMatricula(MatriculaDTO dto) {
		Alumno alumno = alumnoRepository.findById(dto.getAlumnoId())
				.orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

		CentroEducativo centro = centroEducativoRepository.findById(dto.getCentroEducativoId())
				.orElseThrow(() -> new RuntimeException("Centro no encontrado"));

		Curso curso = cursoRepository.findById(dto.getCursoId())
				.orElseThrow(() -> new RuntimeException("Curso no encontrado"));

		alumno.setCentroEducativo(centro);
		alumnoRepository.save(alumno);

		Matricula matricula = new Matricula();
		matricula.setAlumno(alumno);
		matricula.setCentroEducativo(centro);
		matricula.setCurso(curso);
		matricula.setAnioAcademico(dto.getAnioAcademico());

		return matriculaRepository.save(matricula);
	}

	@Override
	public Page<Matricula> obtenerMatriculas(Pageable pageable, Long centroId, String search, Long cursoId,
			Integer anioAcademico) {

		Specification<Matricula> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (centroId != null) {
				predicates.add(cb.equal(root.get("centroEducativo").get("id"), centroId));
			}

			if (search != null && !search.isEmpty()) {
				String searchLower = "%" + search.toLowerCase() + "%";
				Join<Matricula, Alumno> alumnoJoin = root.join("alumno");
				Join<Matricula, CentroEducativo> centroJoin = root.join("centroEducativo");
				Predicate nombrePred = cb.like(cb.lower(alumnoJoin.get("nombre")), searchLower);
				Predicate apellidosPred = cb.like(cb.lower(alumnoJoin.get("apellidos")), searchLower);
				Predicate centroPred = cb.like(cb.lower(centroJoin.get("nombre")), searchLower);
				predicates.add(cb.or(nombrePred, apellidosPred, centroPred));
			}

			if (cursoId != null) {
				predicates.add(cb.equal(root.get("curso").get("id"), cursoId));
			}

			if (anioAcademico != null) {
				predicates.add(cb.equal(root.get("anioAcademico"), anioAcademico));
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		if (pageable.getSort().isUnsorted()) {
			pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
					Sort.by("alumno.apellidos").ascending());
		}

		return matriculaRepository.findAll(spec, pageable);
	}

	@Override
	public List<Matricula> obtenerMatriculasPorAlumno(Long alumnoId) {
		return matriculaRepository.findByAlumnoIdOrderByAnioAcademicoDesc(alumnoId);
	}

	@Override
	public List<Integer> obtenerAnios() {
		return matriculaRepository.findDistinctAnioAcademico();
	}

}
