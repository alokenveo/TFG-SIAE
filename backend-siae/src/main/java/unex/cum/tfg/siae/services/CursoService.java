package unex.cum.tfg.siae.services;

import java.util.List;

import unex.cum.tfg.siae.model.Curso;

public interface CursoService {

	List<Curso> obtenerCursos();

	List<Curso> obtenerCursosPorNivel(Long nivelId);

}
