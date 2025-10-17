package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.Asignatura;

public interface AsignaturaService {

	List<Asignatura> obtenerAsignaturas();

	List<Asignatura> obtenerAsignaturasPorCurso(Long cursoId);

}
