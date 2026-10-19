package esprit.canditature.dto;

import java.time.LocalDate;

public record CandidatureDetails(
        Long id,
        String motivation,
        LocalDate applicationDate,
        Candidate candidate,
        JobResponse job
) {
}
