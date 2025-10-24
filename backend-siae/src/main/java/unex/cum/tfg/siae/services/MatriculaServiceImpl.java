package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;

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

		Matricula matricula = new Matricula();
		matricula.setAlumno(alumno);
		matricula.setCentroEducativo(centro);
		matricula.setCurso(curso);
		matricula.setAnioAcademico(dto.getAnioAcademico());

		return matriculaRepository.save(matricula);
	}

	@Override
	public List<Matricula> obtenerMatriculas() {
		return matriculaRepository.findAll();
	}

	@Override
	public List<Matricula> obtenerMatriculasPorCentro(Long centroId) {
		return matriculaRepository.findByCentroEducativoId(centroId);
	}

}
