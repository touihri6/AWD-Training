package esprit.canditature;

import com.fasterxml.jackson.databind.ObjectMapper;
import esprit.canditature.dto.Address;
import esprit.canditature.dto.Candidate;
import esprit.canditature.dto.CategoryResponse;
import esprit.canditature.dto.JobResponse;
import esprit.canditature.feignClient.CandidatClient;
import esprit.canditature.feignClient.JobClient;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class CandidatureApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @MockBean
    private CandidatClient candidatClient;

    @MockBean
    private JobClient jobClient;

    private static final Candidate BADIA = new Candidate(1L, "Badia", "Abouhdid", "badia@example.com",
            new Address(1L, "Avenue Habib Bourguiba", "12B", "1001", 1L));
    private static final CategoryResponse CATEGORY = new CategoryResponse(1L, "Software Development", "Dev jobs");
    private static final JobResponse OPEN_JOB = new JobResponse(1L, "Java Developer", "Spring Boot", true, LocalDate.of(2026, 9, 28), CATEGORY);
    private static final JobResponse CLOSED_JOB = new JobResponse(2L, "Data Engineer", "Pipelines", false, LocalDate.of(2026, 7, 15), CATEGORY);

    private String body(long candidateId, long jobId) {
        return """
                {"candidateId":%d,"jobId":%d,"motivation":"Motivated","applicationDate":"2026-10-01"}
                """.formatted(candidateId, jobId);
    }

    private FeignException.NotFound notFound(String url) {
        Request request = Request.create(Request.HttpMethod.GET, url, Map.of(), null, StandardCharsets.UTF_8, null);
        return new FeignException.NotFound("404", request, null, Map.of());
    }

    private long create(long candidateId, long jobId) throws Exception {
        String json = mvc.perform(post("/mic3/candidature").contentType(MediaType.APPLICATION_JSON).content(body(candidateId, jobId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(json).get("id").asLong();
    }

    @Test
    void createStoresOnlyIdsAndDetailsAreEnriched() throws Exception {
        when(candidatClient.findById(1L)).thenReturn(BADIA);
        when(jobClient.findById(1L)).thenReturn(OPEN_JOB);
        long id = create(1, 1);

        mvc.perform(get("/mic3/candidature/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.candidateId").value(1))
                .andExpect(jsonPath("$.jobId").value(1))
                .andExpect(jsonPath("$.candidate").doesNotExist());

        mvc.perform(get("/mic3/candidature/" + id + "/details"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.motivation").value("Motivated"))
                .andExpect(jsonPath("$.applicationDate").value("2026-10-01"))
                .andExpect(jsonPath("$.candidate.firstname").value("Badia"))
                .andExpect(jsonPath("$.candidate.address.zipCode").value("1001"))
                .andExpect(jsonPath("$.job.name").value("Java Developer"))
                .andExpect(jsonPath("$.job.category.name").value("Software Development"));

        mvc.perform(get("/mic3/candidature")).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void businessRules() throws Exception {
        when(candidatClient.findById(1L)).thenReturn(BADIA);
        when(jobClient.findById(1L)).thenReturn(OPEN_JOB);
        when(jobClient.findById(2L)).thenReturn(CLOSED_JOB);
        when(candidatClient.findById(99L)).thenThrow(notFound("/mic1/candidates/99"));
        create(1, 1);

        mvc.perform(post("/mic3/candidature").contentType(MediaType.APPLICATION_JSON).content(body(1, 1)))
                .andExpect(status().isConflict());
        mvc.perform(post("/mic3/candidature").contentType(MediaType.APPLICATION_JSON).content(body(1, 2)))
                .andExpect(status().isConflict());
        mvc.perform(post("/mic3/candidature").contentType(MediaType.APPLICATION_JSON).content(body(99, 1)))
                .andExpect(status().isNotFound());
        mvc.perform(post("/mic3/candidature").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownCandidatureAndDelete() throws Exception {
        when(candidatClient.findById(1L)).thenReturn(BADIA);
        when(jobClient.findById(1L)).thenReturn(OPEN_JOB);
        long id = create(1, 1);

        mvc.perform(get("/mic3/candidature/999")).andExpect(status().isNotFound());
        mvc.perform(get("/mic3/candidature/999/details")).andExpect(status().isNotFound());

        mvc.perform(delete("/mic3/candidature/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/mic3/candidature/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void remoteServiceDownReturns503() throws Exception {
        when(candidatClient.findById(1L)).thenReturn(BADIA);
        when(jobClient.findById(1L)).thenReturn(OPEN_JOB);
        long id = create(1, 1);

        Request request = Request.create(Request.HttpMethod.GET, "/mic2/jobs/1", Map.of(), null, StandardCharsets.UTF_8, null);
        when(jobClient.findById(1L)).thenThrow(new FeignException.ServiceUnavailable("503", request, null, Map.of()));
        mvc.perform(get("/mic3/candidature/" + id + "/details")).andExpect(status().isServiceUnavailable());
    }
}
