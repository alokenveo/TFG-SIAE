package unex.cum.tfg.siae.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
		http
				// 1. Configurar CORS usando la fuente definida
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				// 2. Deshabilitar CSRF (importante para APIs stateless)
				.csrf(csrf -> csrf.disable())

				// 3. Configurar gestión de sesión como STATELESS
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// 4. Definir reglas de autorización
				.authorizeHttpRequests(auth -> auth
						// Permitir explícitamente peticiones OPTIONS (CORS preflight)
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// Endpoints Públicos
						.requestMatchers("/api/auth/login").permitAll()
						.requestMatchers("/api/usuarios/registrar-invitado").permitAll()
						.requestMatchers("/api/auth/request-reset").permitAll()
						.requestMatchers("/api/auth/reset-password").permitAll()

						// Endpoints ADMIN
						.requestMatchers("/api/usuarios/**").hasRole("ADMIN").requestMatchers("/api/centros/**")
						.hasRole("ADMIN")

						// Endpoints ADMIN y GESTOR
						.requestMatchers("/api/alumnos/**").hasAnyRole("ADMIN", "GESTOR")
						.requestMatchers("/api/matriculas/**").hasAnyRole("ADMIN", "GESTOR")
						.requestMatchers("/api/notas/**").hasAnyRole("ADMIN", "GESTOR")
						.requestMatchers("/api/personal/**").hasAnyRole("ADMIN", "GESTOR")

						// Endpoints Autenticados (consulta)
						.requestMatchers("/api/oferta-educativa/**").authenticated()
						.requestMatchers("/api/dashboard/**").authenticated()
						.requestMatchers("/api/ia/**").authenticated()

						// Cualquier otra petición requiere autenticación
						.anyRequest().authenticated())

				// 5. Añadir el filtro JWT en la posición correcta
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
