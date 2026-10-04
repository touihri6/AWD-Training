package com.awd.monolith;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Runs against in-memory H2 (see src/test/resources/application.properties), no MySQL needed. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AwdMonolithApiIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    // ---------- helpers ----------

    private long create(String url, String body) throws Exception {
        String json = mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(json).get("id").asLong();
    }

    private long candidate(String email) throws Exception {
        return create("/api/candidates", """
                {"firstname":"Badia","lastname":"Abouhdid","email":"%s",
                 "address":{"street":"Avenue Habib Bourguiba","houseNumber":"12","zipCode":"1001"}}
                """.formatted(email));
    }

    private long job(String name, boolean available) throws Exception {
        long cat = create("/api/categories", "{\"name\":\"Cat " + name + "\"}");
        return create("/api/jobs", """
                {"name":"%s","description":"d","available":%s,"date":"2026-09-01","categoryId":%d}
                """.formatted(name, available, cat));
    }

    private String application(long candidateId, long jobId) {
        return """
                {"candidateId":%d,"jobId":%d,"motivation":"Motivated","applicationDate":"2026-09-20"}
                """.formatted(candidateId, jobId);
    }

    // ---------- candidat & job modules ----------

    @Test
    void candidateAndJobCrudStillWork() throws Exception {
        long c = candidate("a@example.com");
        mvc.perform(get("/api/candidates/" + c))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address.zipCode").value("1001"));

        long j = job("Java Dev", true);
        mvc.perform(get("/api/jobs/" + j))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category.name").value("Cat Java Dev"));
    }

    // ---------- candidature module ----------

    @Test
    void applyToJobAndReadIt() throws Exception {
        long c = candidate("a@example.com");
        long j = job("Java Dev", true);
        long id = create("/api/applications", application(c, j));

        mvc.perform(get("/api/applications/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motivation").value("Motivated"))
                .andExpect(jsonPath("$.applicationDate").value("2026-09-20"))
                .andExpect(jsonPath("$.candidate.id").value(c))
                .andExpect(jsonPath("$.candidate.email").value("a@example.com"))
                .andExpect(jsonPath("$.job.id").value(j))
                .andExpect(jsonPath("$.job.category").value("Cat Java Dev"));
    }

    @Test
    void applicationDateDefaultsToToday() throws Exception {
        long c = candidate("a@example.com");
        long j = job("Java Dev", true);
        mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"candidateId\":%d,\"jobId\":%d}".formatted(c, j)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.applicationDate").value(java.time.LocalDate.now().toString()));
    }

    @Test
    void cannotApplyTwiceOrToClosedJob() throws Exception {
        long c = candidate("a@example.com");
        long open = job("Open", true);
        long closed = job("Closed", false);

        create("/api/applications", application(c, open));
        mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(application(c, open)))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(application(c, closed)))
                .andExpect(status().isConflict());
    }

    @Test
    void validationAndUnknownIds() throws Exception {
        mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.candidateId").exists())
                .andExpect(jsonPath("$.errors.jobId").exists());

        long j = job("Java Dev", true);
        mvc.perform(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(application(999, j)))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/applications/999")).andExpect(status().isNotFound());
    }

    @Test
    void filterByCandidateAndJob() throws Exception {
        long c1 = candidate("a@example.com");
        long c2 = candidate("b@example.com");
        long j1 = job("Java Dev", true);
        long j2 = job("Angular Dev", true);
        create("/api/applications", application(c1, j1));
        create("/api/applications", application(c1, j2));
        create("/api/applications", application(c2, j1));

        mvc.perform(get("/api/applications")).andExpect(jsonPath("$.length()").value(3));
        mvc.perform(get("/api/applications?candidateId=" + c1)).andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/applications?jobId=" + j1)).andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/candidates/" + c2 + "/applications")).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/jobs/" + j2 + "/applications")).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void updateAndDeleteApplication() throws Exception {
        long c = candidate("a@example.com");
        long j = job("Java Dev", true);
        long id = create("/api/applications", application(c, j));

        mvc.perform(put("/api/applications/" + id).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivation\":\"New text\",\"applicationDate\":\"2026-09-21\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motivation").value("New text"))
                .andExpect(jsonPath("$.applicationDate").value("2026-09-21"));

        mvc.perform(delete("/api/applications/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/applications/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void candidateOrJobWithApplicationsCannotBeDeleted() throws Exception {
        long c = candidate("a@example.com");
        long j = job("Java Dev", true);
        long id = create("/api/applications", application(c, j));

        mvc.perform(delete("/api/candidates/" + c)).andExpect(status().isConflict());
        mvc.perform(delete("/api/jobs/" + j)).andExpect(status().isConflict());

        mvc.perform(delete("/api/applications/" + id)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/candidates/" + c)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/jobs/" + j)).andExpect(status().isNoContent());
    }

    private String meeting(String reference, long applicationId) {
        return """
                {"reference":"%s","link":"https://meet.example.com/x","applicationId":%d}
                """.formatted(reference, applicationId);
    }

    @Test
    void scheduleMeetingAndFollowItsStatus() throws Exception {
        long app = create("/api/applications", application(candidate("a@example.com"), job("Java Dev", true)));
        long id = create("/api/meetings", meeting("MEET-1", app));

        mvc.perform(get("/api/meetings/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.application.id").value(app))
                .andExpect(jsonPath("$.application.candidateEmail").value("a@example.com"));

        mvc.perform(patch("/api/meetings/" + id + "/status").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"HELD\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("HELD"));
        mvc.perform(patch("/api/meetings/" + id + "/status").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CANCELLED\"}"))
                .andExpect(status().isConflict());

        mvc.perform(get("/api/meetings?status=HELD")).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/meetings?status=SCHEDULED")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void meetingRules() throws Exception {
        long c = candidate("a@example.com");
        long app1 = create("/api/applications", application(c, job("Java Dev", true)));
        long app2 = create("/api/applications", application(c, job("Angular Dev", true)));
        long id = create("/api/meetings", meeting("MEET-1", app1));

        mvc.perform(post("/api/meetings").contentType(MediaType.APPLICATION_JSON).content(meeting("MEET-1", app2)))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/meetings").contentType(MediaType.APPLICATION_JSON).content(meeting("MEET-2", app1)))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/meetings").contentType(MediaType.APPLICATION_JSON).content(meeting("MEET-2", 999)))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/meetings").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"link\":\"not-a-url\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.reference").exists())
                .andExpect(jsonPath("$.errors.link").exists())
                .andExpect(jsonPath("$.errors.applicationId").exists());

        mvc.perform(put("/api/meetings/" + id).contentType(MediaType.APPLICATION_JSON).content(meeting("MEET-1B", app1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reference").value("MEET-1B"));

        mvc.perform(delete("/api/meetings/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/meetings/" + id)).andExpect(status().isNotFound());
    }

    private String notification(String recipient, long applicationId) {
        return """
                {"sender":"hr@awd.tn","recipient":"%s","content":"Application received",
                 "date":"2026-09-25T10:00:00","applicationId":%d}
                """.formatted(recipient, applicationId);
    }

    @Test
    void notificationCrudAndFilter() throws Exception {
        long c = candidate("a@example.com");
        long app1 = create("/api/applications", application(c, job("Java Dev", true)));
        long app2 = create("/api/applications", application(c, job("Angular Dev", true)));
        long id = create("/api/notifications", notification("A@Example.com", app1));
        create("/api/notifications", notification("b@example.com", app2));

        mvc.perform(get("/api/notifications/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recipient").value("a@example.com"))
                .andExpect(jsonPath("$.date").value("2026-09-25T10:00:00"))
                .andExpect(jsonPath("$.applicationId").value(app1));
        mvc.perform(get("/api/notifications")).andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/notifications?recipient=a@example.com")).andExpect(jsonPath("$.length()").value(1));

        mvc.perform(post("/api/notifications").contentType(MediaType.APPLICATION_JSON).content(notification("c@example.com", app1)))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/notifications").contentType(MediaType.APPLICATION_JSON).content(notification("c@example.com", 999)))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/notifications").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sender\":\"nope\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.sender").exists())
                .andExpect(jsonPath("$.errors.recipient").exists())
                .andExpect(jsonPath("$.errors.date").exists());

        mvc.perform(put("/api/notifications/" + id).contentType(MediaType.APPLICATION_JSON).content(notification("z@example.com", app1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recipient").value("z@example.com"));

        mvc.perform(delete("/api/notifications/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/notifications/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void deletingApplicationAlsoDeletesItsMeetingAndNotification() throws Exception {
        long app = create("/api/applications", application(candidate("a@example.com"), job("Java Dev", true)));
        long m = create("/api/meetings", meeting("MEET-1", app));
        long n = create("/api/notifications", notification("a@example.com", app));

        mvc.perform(delete("/api/applications/" + app)).andExpect(status().isNoContent());
        mvc.perform(get("/api/meetings/" + m)).andExpect(status().isNotFound());
        mvc.perform(get("/api/notifications/" + n)).andExpect(status().isNotFound());
    }

    @Test
    void swaggerDocsExposeAllModules() throws Exception {
        mvc.perform(get("/v3/api-docs/0-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("AWD Recruitment API (monolith)"))
                .andExpect(jsonPath("$.paths['/api/candidates']").exists())
                .andExpect(jsonPath("$.paths['/api/jobs']").exists())
                .andExpect(jsonPath("$.paths['/api/applications']").exists())
                .andExpect(jsonPath("$.paths['/api/meetings']").exists())
                .andExpect(jsonPath("$.paths['/api/notifications']").exists());
        mvc.perform(get("/v3/api-docs/4-meeting"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/meetings/{id}/status']").exists());
        mvc.perform(get("/v3/api-docs/5-notification"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/notifications/{id}']").exists());
        mvc.perform(get("/v3/api-docs/3-candidature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/applications/{id}']").exists());
    }
}
