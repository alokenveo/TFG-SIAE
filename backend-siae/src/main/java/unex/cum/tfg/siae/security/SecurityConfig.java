package unex.cum.tfg.siae.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

	@Autowired
	private JwtAuthenticationFilter jwtAuthenticationFilter;

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		// 1. Orígenes permitidos (tu frontend)
		configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
		// 2. Métodos permitidos (GET, POST, PUT, DELETE, OPTIONS)
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		// 3. Cabeceras permitidas (incluyendo Authorization)
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", configuration); // Aplica esta config a toda tu API
		return source;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf().disable() // Desactivamos CSRF (común en APIs stateless)
				.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS) // No creamos sesiones
				.and().authorizeHttpRequests(auth -> auth
						// 1. Endpoints Públicos (Login y Registro de Invitado)
						.requestMatchers("/api/auth/login").permitAll()
						.requestMatchers("/api/usuarios/registrar-invitado").permitAll()

						// 2. Endpoints de ADMIN (Gestión de Usuarios y Centros)
						.requestMatchers("/api/usuarios/**").hasRole("ADMIN").requestMatchers("/api/centros/**")
						.hasRole("ADMIN")

						// 3. Endpoints de ADMIN y GESTOR (Gestión de Alumnos, Matrículas, Notas)
						.requestMatchers("/api/alumnos/**").hasAnyRole("ADMIN", "GESTOR")
						.requestMatchers("/api/matriculas/**").hasAnyRole("ADMIN", "GESTOR")
						.requestMatchers("/api/notas/**").hasAnyRole("ADMIN", "GESTOR")

						// 4. Endpoints de consulta (Lectura) para usuarios autenticados
						.requestMatchers("/api/oferta-educativa/**").authenticated()

						// 5. El resto de peticiones requieren autenticación
						.anyRequest().authenticated());

		// 6. Añadimos nuestro filtro JWT antes del filtro de username/password
		http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
