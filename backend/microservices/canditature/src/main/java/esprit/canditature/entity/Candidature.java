package esprit.canditature.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "candidature",
        uniqueConstraints = @UniqueConstraint(name = "uk_candidature_candidate_job", columnNames = {"candidate_id", "job_id"}))
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(length = 2000)
    private String motivation;

    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;

    public Candidature() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public LocalDate getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }
}
