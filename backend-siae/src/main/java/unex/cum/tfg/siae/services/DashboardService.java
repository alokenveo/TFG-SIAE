package unex.cum.tfg.siae.services;

import java.util.Map;

public interface DashboardService {

	Map<String, Object> getAdminDashboardStats(int anioAcademico);

	Map<String, Object> getGestorDashboardStats(Long centroId, int anioAcademico);
}
