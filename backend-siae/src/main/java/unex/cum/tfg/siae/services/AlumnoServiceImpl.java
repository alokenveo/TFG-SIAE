package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.repository.AlumnoRepository;

@Service
public class AlumnoServiceImpl implements AlumnoService {

	private final AlumnoRepository alumnoRepository;

	public AlumnoServiceImpl(AlumnoRepository alumnoRepository) {
		this.alumnoRepository = alumnoRepository;
	}

	@Override
	public Alumno registarAlumno(Alumno alumno) {
		return alumnoRepository.save(alumno);
	}

	@Override
	public List<Alumno> obtenerAlumnos() {
		return alumnoRepository.findAll();
	}

}
