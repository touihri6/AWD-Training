package esprit.canditature.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CandidatureRequest(

        @NotNull(message = "candidateId is required")
        Long candidateId,

        @NotNull(message = "jobId is required")
        Long jobId,

        @Size(max = 2000, message = "motivation must be at most 2000 characters")
        String motivation,

        @PastOrPresent(message = "applicationDate cannot be in the future")
        LocalDate applicationDate
) {
}
