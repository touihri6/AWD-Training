package esprit.canditature.dto;

import java.time.LocalDate;

public record CandidatureResponse(
        Long id,
        Long candidateId,
        Long jobId,
        String motivation,
        LocalDate applicationDate
) {
}
