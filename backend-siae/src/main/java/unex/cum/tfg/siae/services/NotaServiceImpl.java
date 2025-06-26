package unex.cum.tfg.siae.services;

import org.springframework.stereotype.Service;

import unex.cum.tfg.siae.model.Alumno;
import unex.cum.tfg.siae.model.Asignatura;
import unex.cum.tfg.siae.model.Curso;
import unex.cum.tfg.siae.model.Nota;
import unex.cum.tfg.siae.model.NotaDTO;
import unex.cum.tfg.siae.repository.AlumnoRepository;
import unex.cum.tfg.siae.repository.AsignaturaRepository;
import unex.cum.tfg.siae.repository.CursoRepository;
import unex.cum.tfg.siae.repository.NotaRepository;

@Service
public class NotaServiceImpl implements NotaService {

	private final AlumnoRepository alumnoRepo;

	private final AsignaturaRepository asignaturaRepo;

	private final CursoRepository cursoRepo;

	private final NotaRepository notaRepo;

	public NotaServiceImpl(AlumnoRepository alumnoRepo, AsignaturaRepository asignaturaRepo, CursoRepository cursoRepo,
			NotaRepository notaRepo) {
		this.alumnoRepo = alumnoRepo;
		this.asignaturaRepo = asignaturaRepo;
		this.cursoRepo = cursoRepo;
		this.notaRepo = notaRepo;
	}
	
	
	@Override
	public Nota registrarNota(NotaDTO dto) {
        Alumno alumno = alumnoRepo.findById(dto.getAlumnoId())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        Asignatura asignatura = asignaturaRepo.findById(dto.getAsignaturaId())
                .orElseThrow(() -> new RuntimeException("Asignatura no encontrada"));

        Curso curso = cursoRepo.findById(dto.getCursoId())
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        Nota nota = new Nota();
        nota.setAlumno(alumno);
        nota.setAsignatura(asignatura);
        nota.setCurso(curso);
        nota.setAnioAcademico(dto.getAnioAcademico());
        nota.setCalificacion(dto.getCalificacion());

        return notaRepo.save(nota);
    }

}
