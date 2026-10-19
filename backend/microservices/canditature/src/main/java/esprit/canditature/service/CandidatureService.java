package esprit.canditature.service;

import esprit.canditature.dto.Candidate;
import esprit.canditature.dto.CandidatureDetails;
import esprit.canditature.dto.CandidatureRequest;
import esprit.canditature.dto.CandidatureResponse;
import esprit.canditature.dto.JobResponse;
import esprit.canditature.entity.Candidature;
import esprit.canditature.feignClient.CandidatClient;
import esprit.canditature.feignClient.JobClient;
import esprit.canditature.repository.CandidatureRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class CandidatureService {

    private final CandidatureRepository repository;
    private final CandidatClient candidatClient;
    private final JobClient jobClient;

    public CandidatureService(CandidatureRepository repository, CandidatClient candidatClient, JobClient jobClient) {
        this.repository = repository;
        this.candidatClient = candidatClient;
        this.jobClient = jobClient;
    }

    public CandidatureResponse create(CandidatureRequest request) {
        candidatClient.findById(request.candidateId());
        JobResponse job = jobClient.findById(request.jobId());

        if (!job.available()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Job " + request.jobId() + " is not available anymore");
        }
        if (repository.existsByCandidateIdAndJobId(request.candidateId(), request.jobId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Candidate " + request.candidateId() + " already applied to job " + request.jobId());
        }

        Candidature candidature = new Candidature();
        candidature.setCandidateId(request.candidateId());
        candidature.setJobId(request.jobId());
        candidature.setMotivation(request.motivation());
        candidature.setApplicationDate(request.applicationDate() != null ? request.applicationDate() : LocalDate.now());
        return toResponse(repository.save(candidature));
    }

    public List<CandidatureResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public CandidatureResponse findById(Long id) {
        return toResponse(getCandidature(id));
    }

    public CandidatureDetails getDetails(Long id) {
        Candidature candidature = getCandidature(id);
        Candidate candidate = candidatClient.findById(candidature.getCandidateId());
        JobResponse job = jobClient.findById(candidature.getJobId());
        return new CandidatureDetails(candidature.getId(), candidature.getMotivation(),
                candidature.getApplicationDate(), candidate, job);
    }

    public void delete(Long id) {
        repository.delete(getCandidature(id));
    }

    private Candidature getCandidature(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature " + id + " not found"));
    }

    private CandidatureResponse toResponse(Candidature candidature) {
        return new CandidatureResponse(candidature.getId(), candidature.getCandidateId(), candidature.getJobId(),
                candidature.getMotivation(), candidature.getApplicationDate());
    }
}
