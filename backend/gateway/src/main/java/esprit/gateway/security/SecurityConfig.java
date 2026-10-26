package esprit.gateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    public static final String CANDIDATE = "CANDIDATE";
    public static final String RECRUITER = "RECRUITER";

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        .pathMatchers(HttpMethod.POST, "/mic3/candidature/**").hasRole(CANDIDATE)
                        .pathMatchers(HttpMethod.POST, "/mic2/jobs/**").hasRole(RECRUITER)
                        .pathMatchers(HttpMethod.PUT, "/mic2/jobs/**").hasRole(RECRUITER)
                        .pathMatchers(HttpMethod.PATCH, "/mic2/jobs/**").hasRole(RECRUITER)
                        .pathMatchers(HttpMethod.DELETE, "/mic2/jobs/**").hasRole(RECRUITER)
                        .pathMatchers(HttpMethod.POST, "/api/categories/**").hasRole(RECRUITER)
                        .pathMatchers(HttpMethod.PUT, "/api/categories/**").hasRole(RECRUITER)
                        .pathMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole(RECRUITER)
                        .anyExchange().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .build();
    }

    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRealmRoleConverter());
        converter.setPrincipalClaimName("preferred_username");
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }
}
