package esprit.gateway.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.util.List;
import java.util.Map;

import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "eureka.client.enabled=false",
                "spring.cloud.discovery.enabled=false"
        })
@AutoConfigureWebTestClient
class SecurityRulesTest {

    @Autowired
    private WebTestClient client;

    private WebTestClient as(String... roles) {
        return client.mutateWith(mockJwt()
                .jwt(jwt -> jwt.claim("preferred_username", "user")
                        .claim("realm_access", Map.of("roles", List.of(roles))))
                .authorities(new KeycloakRealmRoleConverter()));
    }

    @Test
    void requestWithoutTokenIsRejectedWith401() {
        client.get().uri("/mic1/candidates").exchange()
                .expectStatus().isUnauthorized()
                .expectHeader().valueMatches("WWW-Authenticate", "Bearer.*");
    }

    @Test
    void requestWithBadTokenIsRejectedWith401() {
        client.get().uri("/mic1/candidates")
                .header("Authorization", "Bearer not-a-jwt")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void authenticatedUserPassesTheGatewayForReads() {
        as("CANDIDATE").get().uri("/mic1/candidates").exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void candidateCanApply() {
        as("CANDIDATE").post().uri("/mic3/candidature")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"candidateId\":1,\"jobId\":1,\"motivation\":\"Spring\"}")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void recruiterCannotApply() {
        as("RECRUITER").post().uri("/mic3/candidature")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{}")
                .exchange()
                .expectStatus().isForbidden();
    }

    @Test
    void recruiterCanPublishAJob() {
        as("RECRUITER").post().uri("/mic2/jobs")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"name\":\"Java Developer\"}")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void candidateCannotPublishOrChangeAJob() {
        as("CANDIDATE").post().uri("/mic2/jobs").contentType(MediaType.APPLICATION_JSON).bodyValue("{}")
                .exchange().expectStatus().isForbidden();
        as("CANDIDATE").put().uri("/mic2/jobs/1").contentType(MediaType.APPLICATION_JSON).bodyValue("{}")
                .exchange().expectStatus().isForbidden();
        as("CANDIDATE").patch().uri("/mic2/jobs/1/availability?available=false")
                .exchange().expectStatus().isForbidden();
        as("CANDIDATE").delete().uri("/mic2/jobs/1")
                .exchange().expectStatus().isForbidden();
    }

    @Test
    void userWithoutRoleCannotApply() {
        as().post().uri("/mic3/candidature").contentType(MediaType.APPLICATION_JSON).bodyValue("{}")
                .exchange().expectStatus().isForbidden();
    }

    @Test
    void corsPreflightIsNotBlockedBySecurity() {
        client.options().uri("http://localhost:8080/mic3/candidature")
                .header("Origin", "http://localhost:4200")
                .header("Access-Control-Request-Method", "POST")
                .exchange()
                .expectStatus().isOk()
                .expectHeader().valueEquals("Access-Control-Allow-Origin", "http://localhost:4200");
    }
}
