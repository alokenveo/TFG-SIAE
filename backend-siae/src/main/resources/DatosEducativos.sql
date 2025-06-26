INSERT INTO nivel_educativo (id, nombre) VALUES
(1, 'Educación Infantil'),
(2, 'Educación Primaria'),
(3, 'Educación Secundaria Obligatoria'),
(4, 'Bachillerato');


-- Educación Infantil (3 cursos)
INSERT INTO curso (id, orden, nombre, nivel_id, centro_id) VALUES
(1, 1, '1º de Infantil', 1, NULL),
(2, 2, '2º de Infantil', 1, NULL),
(3, 3, '3º de Infantil', 1, NULL);

-- Educación Primaria (6 cursos)
INSERT INTO curso (id, orden, nombre, nivel_id, centro_id) VALUES
(4, 1, '1º de Primaria', 2, NULL),
(5, 2, '2º de Primaria', 2, NULL),
(6, 3, '3º de Primaria', 2, NULL),
(7, 4, '4º de Primaria', 2, NULL),
(8, 5, '5º de Primaria', 2, NULL),
(9, 6, '6º de Primaria', 2, NULL);

-- Educación Secundaria Obligatoria (4 cursos)
INSERT INTO curso (id, orden, nombre, nivel_id, centro_id) VALUES
(10, 1, '1º de ESO', 3, NULL),
(11, 2, '2º de ESO', 3, NULL),
(12, 3, '3º de ESO', 3, NULL),
(13, 4, '4º de ESO', 3, NULL);

-- Bachillerato (2 cursos)
INSERT INTO curso (id, orden, nombre, nivel_id, centro_id) VALUES
(14, 1, '1º de Bachillerato', 4, NULL),
(15, 2, '2º de Bachillerato', 4, NULL);



-- Asignaturas de 1º Primaria
INSERT INTO asignatura (id, nombre, curso_id) VALUES
(1, 'Lengua Española', 4),
(2, 'Matemáticas', 4),
(3, 'Conocimiento del Medio', 4),
(4, 'Educación Física', 4);

-- Asignaturas de 1º de ESO
INSERT INTO asignatura (id, nombre, curso_id) VALUES
(5, 'Lengua Española', 10),
(6, 'Matemáticas', 10),
(7, 'Geografía', 10),
(8, 'Educación Física', 10);

-- Asignaturas de 1º de Bachillerato
INSERT INTO asignatura (id, nombre, curso_id) VALUES
(9, 'Lengua y Literatura', 14),
(10, 'Matemáticas I', 14),
(11, 'Física y Química', 14),
(12, 'Historia del Mundo Contemporáneo', 14);


-- Centro 1 ofrece Infantil, Primaria y ESO
INSERT INTO centro_nivel (centro_id, nivel_id) VALUES
(1, 1), -- Infantil
(1, 2), -- Primaria
(1, 3); -- ESO

-- Centro 2 ofrece solo Bachillerato
INSERT INTO centro_nivel (centro_id, nivel_id) VALUES
(2, 4);


INSERT INTO centro_educativo (id, nombre, direccion, provincia, tipo)
VALUES (1, 'La Salle Lea', 'Lea', 'LITORAL', 'PRIVADO');
INSERT INTO centro_educativo (id, nombre, direccion, provincia, tipo)
VALUES (2, 'Colegio Nacional Bioko', 'Malabo Centro', 'BIOKO_NORTE', 'PUBLICO');
INSERT INTO centro_educativo (id, nombre, direccion, provincia, tipo)
VALUES (3, 'La Antorcha', 'Nfefesala', 'LITORAL', 'PUBLICO');
INSERT INTO centro_educativo (id, nombre, direccion, provincia, tipo)
VALUES (4, 'Rafael Mª Nze Abuy', 'Ebibeyin', 'KIE_NTEM', 'PRIVADO');