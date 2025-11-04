package unex.cum.tfg.siae.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.dto.AlumnoDetalleDTO;

public interface AlumnoService {

	Alumno registarAlumno(Alumno alumno);

	Page<Alumno> obtenerAlumnos(Pageable pageable, Long centroId, String search, String sexo, Integer anioInicio,
			Integer anioFin);

	Alumno editarAlumno(Long id, Alumno alumno);

	void eliminarAlumno(Long id);

	AlumnoDetalleDTO obtenerAlumnoPorId(Long id);

	AlumnoDetalleDTO obtenerAlumnoPorDni(String search);
}
