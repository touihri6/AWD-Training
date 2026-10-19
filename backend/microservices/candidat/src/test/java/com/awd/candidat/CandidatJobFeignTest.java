package com.awd.candidat;

import com.awd.candidat.client.JobClient;
import com.awd.candidat.dto.CategoryResponse;
import com.awd.candidat.dto.JobResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "eureka.client.enabled=false")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class CandidatJobFeignTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @MockBean
    private JobClient jobClient;

    private static final CategoryResponse CATEGORY = new CategoryResponse(1L, "Software Development", "Dev jobs");
    private static final JobResponse JAVA = new JobResponse(1L, "Java Developer", "Spring Boot", true, LocalDate.of(2026, 9, 28), CATEGORY);
    private static final JobResponse ANGULAR = new JobResponse(2L, "Angular Developer", "Front-end", true, LocalDate.of(2026, 9, 29), CATEGORY);

    private long candidate() throws Exception {
        String json = mvc.perform(post("/mic1/candidates").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstname\":\"Badia\",\"lastname\":\"Abouhdid\",\"email\":\"badia@example.com\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(json).get("id").asLong();
    }

    private FeignException.NotFound notFound() {
        Request request = Request.create(Request.HttpMethod.GET, "/mic2/jobs/99", Map.of(), null, StandardCharsets.UTF_8, null);
        return new FeignException.NotFound("404", request, null, Map.of());
    }

    @Test
    void listJobsAndGetJobByIdThroughFeign() throws Exception {
        when(jobClient.getAllJobs()).thenReturn(List.of(JAVA, ANGULAR));
        when(jobClient.getJobById(1L)).thenReturn(JAVA);

        mvc.perform(get("/mic1/candidates/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].name").value("Angular Developer"));
        mvc.perform(get("/mic1/candidates/jobs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Java Developer"))
                .andExpect(jsonPath("$.category.name").value("Software Development"));
    }

    @Test
    void unknownJobReturns404() throws Exception {
        when(jobClient.getJobById(99L)).thenThrow(notFound());
        long id = candidate();

        mvc.perform(get("/mic1/candidates/jobs/99")).andExpect(status().isNotFound());
        mvc.perform(post("/mic1/candidates/" + id + "/favorite-jobs/99")).andExpect(status().isNotFound());
        mvc.perform(get("/mic1/candidates/" + id + "/favorite-jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void saveAndListFavoriteJobs() throws Exception {
        when(jobClient.getJobById(1L)).thenReturn(JAVA);
        when(jobClient.getJobById(2L)).thenReturn(ANGULAR);
        long id = candidate();

        mvc.perform(post("/mic1/candidates/" + id + "/favorite-jobs/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Job saved as favorite successfully."));
        mvc.perform(post("/mic1/candidates/" + id + "/favorite-jobs/2")).andExpect(status().isOk());
        mvc.perform(post("/mic1/candidates/" + id + "/favorite-jobs/1")).andExpect(status().isOk());

        mvc.perform(get("/mic1/candidates/" + id + "/favorite-jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    void favoritesOfUnknownCandidateReturn404() throws Exception {
        when(jobClient.getJobById(1L)).thenReturn(JAVA);
        mvc.perform(post("/mic1/candidates/999/favorite-jobs/1")).andExpect(status().isNotFound());
        mvc.perform(get("/mic1/candidates/999/favorite-jobs")).andExpect(status().isNotFound());
    }

    @Test
    void jobMicroserviceDownReturns503() throws Exception {
        Request request = Request.create(Request.HttpMethod.GET, "/mic2/jobs", Map.of(), null, StandardCharsets.UTF_8, null);
        when(jobClient.getAllJobs()).thenThrow(new FeignException.ServiceUnavailable("503", request, null, Map.of()));
        mvc.perform(get("/mic1/candidates/jobs")).andExpect(status().isServiceUnavailable());
    }
}
