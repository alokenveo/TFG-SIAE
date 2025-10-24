package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.Matricula;
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
		return alumnoRepository.save(alumno);
	}

	@Override
	public List<Alumno> obtenerAlumnos() {
		return alumnoRepository.findAll();
	}

	@Override
	public Alumno editarAlumno(Long id, Alumno alumnoDetails) {
		return alumnoRepository.findById(id).map(alumno -> {
			alumno.setNombre(alumnoDetails.getNombre());
			alumno.setApellidos(alumnoDetails.getApellidos());
			alumno.setFechaNacimiento(alumnoDetails.getFechaNacimiento());
			alumno.setSexo(alumnoDetails.getSexo());
			return alumnoRepository.save(alumno);
		}).orElse(null);
	}

	@Override
	public void eliminarAlumno(Long id) {
		alumnoRepository.deleteById(id);
	}

	@Override
	public List<Alumno> obtenerAlumnosPorCentro(Long centroId) {
		return alumnoRepository.findAlumnosByCentroId(centroId);
	}

	@Override
	public List<Alumno> obtenerAlumnosSinCentro() {
		return alumnoRepository.findAlumnosSinCentro();
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

}
