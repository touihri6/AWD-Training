package esprit.canditature.feignClient;

import esprit.canditature.dto.Candidate;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Declarative HTTP client to the CANDIDAT microservice.
 * name = the service name registered in Eureka: no host or port here,
 * Eureka + Spring Cloud LoadBalancer resolve it to an instance (e.g. localhost:8081).
 */
@FeignClient(name = "CANDIDAT")
public interface CandidatClient {

    // Must be the exact path exposed by the candidat controller
    @GetMapping("/mic1/candidates/{id}")
    Candidate findById(@PathVariable("id") Long id);
}
