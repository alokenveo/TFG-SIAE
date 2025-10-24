package unex.cum.tfg.siae.services;

import java.util.List;
import java.util.Optional;

import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.dto.AlumnoDetalleDTO;

public interface AlumnoService {

	Alumno registarAlumno(Alumno alumno);

	List<Alumno> obtenerAlumnos();

	Alumno editarAlumno(Long id, Alumno alumno);

	void eliminarAlumno(Long id);

	List<Alumno> obtenerAlumnosPorCentro(Long centroId);
	
	List<Alumno> obtenerAlumnosSinCentro();
	
	AlumnoDetalleDTO obtenerAlumnoPorId(Long id);
}
