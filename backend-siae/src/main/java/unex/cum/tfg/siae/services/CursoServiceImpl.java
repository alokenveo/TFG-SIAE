package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.Curso;
import unex.cum.tfg.siae.repository.CursoRepository;

@Service
public class CursoServiceImpl implements CursoService {

	private final CursoRepository cursoRepository;

	public CursoServiceImpl(CursoRepository cursoRepository) {
		this.cursoRepository = cursoRepository;
	}

	@Override
	public List<Curso> obtenerCursos() {
		return cursoRepository.findAll();
	}

	@Override
	public List<Curso> obtenerCursosPorNivel(Long nivelId) {
		return cursoRepository.findByNivelId(nivelId);
	}

}
