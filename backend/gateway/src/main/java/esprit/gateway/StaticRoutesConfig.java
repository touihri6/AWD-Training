package esprit.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("static")
public class StaticRoutesConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("candidat", r -> r.path("/mic1/**")
                        .uri("http://localhost:8081"))
                .route("job", r -> r.path("/api/jobs/**", "/api/categories/**")
                        .uri("http://localhost:8082"))
                .build();
    }
}
