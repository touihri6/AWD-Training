package esprit.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.cloud.loadbalancer.annotation.LoadBalancerClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!static")
@LoadBalancerClient(name = "candidat", configuration = CandidatLoadBalancerConfig.class)
public class DynamicRoutesConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("candidat", r -> r.path("/mic1/**")
                        .uri("lb://candidat"))
                .route("job", r -> r.path("/api/jobs/**", "/api/categories/**")
                        .uri("lb://job"))
                .build();
    }
}
