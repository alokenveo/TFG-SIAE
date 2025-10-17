package unex.cum.tfg.siae.services;

import java.util.List;

import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.Asignatura;
import unex.cum.tfg.siae.repository.AsignaturaRepository;

@Service
public class AsignaturaServiceImpl implements AsignaturaService {

	private final AsignaturaRepository asignaturaRepository;

	public AsignaturaServiceImpl(AsignaturaRepository asignaturaRepository) {
		this.asignaturaRepository = asignaturaRepository;
	}

	@Override
	public List<Asignatura> obtenerAsignaturas() {
		return asignaturaRepository.findAll();
	}

	@Override
	public List<Asignatura> obtenerAsignaturasPorCurso(Long cursoId) {
		return asignaturaRepository.findByCursoId(cursoId);
	}

}
