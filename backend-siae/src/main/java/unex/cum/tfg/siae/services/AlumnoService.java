package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.Alumno;

public interface AlumnoService {
	
	Alumno registarAlumno(Alumno alumno);
	List<Alumno> obtenerAlumnos();
}
