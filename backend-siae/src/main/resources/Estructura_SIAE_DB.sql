-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: siae_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alumno`
--

DROP TABLE IF EXISTS `alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumno` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dni` varchar(9) NOT NULL,
  `apellidos` varchar(255) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `sexo` enum('FEMENINO','MASCULINO') DEFAULT NULL,
  `centro_educativo_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  KEY `FKf6pdvdnycgvqsk69dul7ixwj7` (`centro_educativo_id`),
  CONSTRAINT `FKf6pdvdnycgvqsk69dul7ixwj7` FOREIGN KEY (`centro_educativo_id`) REFERENCES `centro_educativo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `asignatura`
--

DROP TABLE IF EXISTS `asignatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignatura` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `curso_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKr7icgav26emducg973dp80fga` (`curso_id`),
  CONSTRAINT `FKr7icgav26emducg973dp80fga` FOREIGN KEY (`curso_id`) REFERENCES `curso` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centro_educativo`
--

DROP TABLE IF EXISTS `centro_educativo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centro_educativo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `direccion` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `provincia` enum('ANNOBON','BIOKO_NORTE','BIOKO_SUR','CENTRO_SUR','DJIBLOHO','KIE_NTEM','LITORAL','WELE_NZAS') DEFAULT NULL,
  `tipo` enum('CONCERTADO','PRIVADO','PUBLICO') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centro_nivel`
--

DROP TABLE IF EXISTS `centro_nivel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centro_nivel` (
  `centro_id` bigint NOT NULL,
  `nivel_id` bigint NOT NULL,
  KEY `FK15ctalpll1ew0gik5qq83bja4` (`nivel_id`),
  KEY `FKo9ac7b90hpd6r8hqbmtsfkqd0` (`centro_id`),
  CONSTRAINT `FK15ctalpll1ew0gik5qq83bja4` FOREIGN KEY (`nivel_id`) REFERENCES `nivel_educativo` (`id`),
  CONSTRAINT `FKo9ac7b90hpd6r8hqbmtsfkqd0` FOREIGN KEY (`centro_id`) REFERENCES `centro_educativo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `curso`
--

DROP TABLE IF EXISTS `curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curso` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `orden` int NOT NULL,
  `nivel_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKal1972fe37nwlblkby2ccf40e` (`nivel_id`),
  CONSTRAINT `FKal1972fe37nwlblkby2ccf40e` FOREIGN KEY (`nivel_id`) REFERENCES `nivel_educativo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `matricula`
--

DROP TABLE IF EXISTS `matricula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matricula` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `anio_academico` int NOT NULL,
  `alumno_id` bigint DEFAULT NULL,
  `centro_educativo_id` bigint DEFAULT NULL,
  `curso_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKha7atjkqv0i3imutwn8mwfnei` (`alumno_id`),
  KEY `FK2478mc7d7ss7htkpbowbr6rv2` (`centro_educativo_id`),
  KEY `FK133qjgbs681xntmnvxvg2g08w` (`curso_id`),
  CONSTRAINT `FK133qjgbs681xntmnvxvg2g08w` FOREIGN KEY (`curso_id`) REFERENCES `curso` (`id`),
  CONSTRAINT `FK2478mc7d7ss7htkpbowbr6rv2` FOREIGN KEY (`centro_educativo_id`) REFERENCES `centro_educativo` (`id`),
  CONSTRAINT `FKha7atjkqv0i3imutwn8mwfnei` FOREIGN KEY (`alumno_id`) REFERENCES `alumno` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=923 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nivel_educativo`
--

DROP TABLE IF EXISTS `nivel_educativo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nivel_educativo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nota`
--

DROP TABLE IF EXISTS `nota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nota` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `anio_academico` int NOT NULL,
  `calificacion` double DEFAULT NULL,
  `alumno_id` bigint DEFAULT NULL,
  `asignatura_id` bigint DEFAULT NULL,
  `curso_id` bigint DEFAULT NULL,
  `evaluacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhehbxqsgubm999qet6vs9mxgg` (`alumno_id`),
  KEY `FKl1om7crs9kaglhtoq6ilcv9av` (`asignatura_id`),
  KEY `FKmjt046cfaurwly6cv76ak93n` (`curso_id`),
  CONSTRAINT `FKhehbxqsgubm999qet6vs9mxgg` FOREIGN KEY (`alumno_id`) REFERENCES `alumno` (`id`),
  CONSTRAINT `FKl1om7crs9kaglhtoq6ilcv9av` FOREIGN KEY (`asignatura_id`) REFERENCES `asignatura` (`id`),
  CONSTRAINT `FKmjt046cfaurwly6cv76ak93n` FOREIGN KEY (`curso_id`) REFERENCES `curso` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25477 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personal`
--

DROP TABLE IF EXISTS `personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `apellidos` varchar(255) DEFAULT NULL,
  `cargo` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `centro_educativo_id` bigint DEFAULT NULL,
  `dni` varchar(9) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKb3wa2ur92ypvj27vgk3m14y5d` (`dni`),
  KEY `FK5mc3652pon8q1rh5tmeo7uosa` (`centro_educativo_id`),
  CONSTRAINT `FK5mc3652pon8q1rh5tmeo7uosa` FOREIGN KEY (`centro_educativo_id`) REFERENCES `centro_educativo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prediccion_alumno`
--

DROP TABLE IF EXISTS `prediccion_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prediccion_alumno` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `alumno_id` bigint NOT NULL,
  `anio_academico` int NOT NULL,
  `prob_repetir` double DEFAULT NULL,
  `n_suspensos_predichos` int DEFAULT NULL,
  `detalle_json` json DEFAULT NULL,
  `fecha_prediccion` datetime DEFAULT CURRENT_TIMESTAMP,
  `prob_abandono` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alumno_id` (`alumno_id`,`anio_academico`),
  UNIQUE KEY `UKprt1t8w62amn4jbhejowf3r4d` (`alumno_id`,`anio_academico`),
  CONSTRAINT `fk_pred_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumno` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prediccion_asignatura`
--

DROP TABLE IF EXISTS `prediccion_asignatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prediccion_asignatura` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `asignatura_id` bigint NOT NULL,
  `anio_academico` int NOT NULL,
  `tasa_suspensos_predicha` double DEFAULT NULL,
  `dificultad_percibida` varchar(255) DEFAULT NULL,
  `fecha_prediccion` datetime DEFAULT CURRENT_TIMESTAMP,
  `nivel_id` int DEFAULT NULL,
  `curso_orden` int DEFAULT NULL,
  `n_alumnos` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asignatura_id` (`asignatura_id`,`anio_academico`),
  CONSTRAINT `fk_pred_asignatura` FOREIGN KEY (`asignatura_id`) REFERENCES `asignatura` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=219 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prediccion_centro`
--

DROP TABLE IF EXISTS `prediccion_centro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prediccion_centro` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `centro_id` bigint NOT NULL,
  `anio_academico` int NOT NULL,
  `tasa_suspensos_predicha` double DEFAULT NULL,
  `ranking_riesgo` int DEFAULT NULL,
  `fecha_prediccion` datetime DEFAULT CURRENT_TIMESTAMP,
  `nota_media` double DEFAULT NULL,
  `num_alumnos` int DEFAULT NULL,
  `impacto_ratio` double DEFAULT NULL,
  `tasa_si_10_docentes_mas` double DEFAULT NULL,
  `json_tendencias` json DEFAULT NULL,
  `json_disparidades` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `centro_id` (`centro_id`,`anio_academico`),
  UNIQUE KEY `UK8s4nyxmqyjnh0xy6owrffr9de` (`centro_id`,`anio_academico`),
  CONSTRAINT `fk_pred_centro` FOREIGN KEY (`centro_id`) REFERENCES `centro_educativo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prediccion_provincia`
--

DROP TABLE IF EXISTS `prediccion_provincia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prediccion_provincia` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `provincia` varchar(255) DEFAULT NULL,
  `anio_academico` int NOT NULL,
  `tasa_suspensos_predicha` double DEFAULT NULL,
  `fecha_prediccion` datetime DEFAULT CURRENT_TIMESTAMP,
  `nota_media` double DEFAULT NULL,
  `num_alumnos` int DEFAULT NULL,
  `impacto_ratio` double DEFAULT NULL,
  `tasa_si_10_docentes_mas` double DEFAULT NULL,
  `json_tendencias` json DEFAULT NULL,
  `json_disparidades` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provincia` (`provincia`,`anio_academico`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `rol` varchar(31) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correo` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `centro_id` bigint DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKm578e1uwggxf3tdy0c5xy4757` (`centro_id`),
  CONSTRAINT `FKm578e1uwggxf3tdy0c5xy4757` FOREIGN KEY (`centro_id`) REFERENCES `centro_educativo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-08 22:58:30
