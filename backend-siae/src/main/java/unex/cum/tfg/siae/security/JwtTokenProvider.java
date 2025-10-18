package unex.cum.tfg.siae.security;

import java.util.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtTokenProvider {

	@Value("${jwt.secret}")
	private String jwtSecretString;
	private SecretKey jwtSecretKey;

	@PostConstruct
	public void init() {
		byte[] keyBytes = Decoders.BASE64.decode(jwtSecretString);
		this.jwtSecretKey = Keys.hmacShaKeyFor(keyBytes);
	}

	private final long jwtExpirationInMs = 86400000; // 24 horas

	public String generateToken(Authentication authentication) {
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();

		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

		// Extraemos los roles
		String roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority)
				.collect(Collectors.joining(","));

		return Jwts.builder().setSubject(userDetails.getUsername()).claim("roles", roles).setIssuedAt(new Date())
				.setExpiration(expiryDate).signWith(jwtSecretKey, SignatureAlgorithm.HS512).compact();
	}

	// 3. Obtiene el email (username) del token
	public String getUsernameFromJWT(String token) {
		Claims claims = Jwts.parserBuilder().setSigningKey(jwtSecretKey).build().parseClaimsJws(token).getBody();

		return claims.getSubject();
	}

	// 4. Valida el token
	public boolean validateToken(String authToken) {
		try {
			Jwts.parserBuilder().setSigningKey(jwtSecretKey).build().parseClaimsJws(authToken);
			return true;
		} catch (Exception ex) {
			// Aquí se podrían loggear los errores (token expirado, malformado, etc.)
			System.err.println("Error al validar el token JWT: " + ex.getMessage());
		}
		return false;
	}

}
