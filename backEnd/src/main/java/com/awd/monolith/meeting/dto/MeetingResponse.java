package com.awd.monolith.meeting.dto;

import com.awd.monolith.meeting.entity.MeetingStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Meeting returned by the API, with a summary of its candidature")
public record MeetingResponse(

        @Schema(example = "1")
        Long id,

        @Schema(example = "MEET-2026-001")
        String reference,

        @Schema(example = "https://meet.example.com/abc-defg-hij")
        String link,

        @Schema(example = "SCHEDULED")
        MeetingStatus status,

        ApplicationSummary application,

        @Schema(example = "2026-09-25T10:00:00")
        LocalDateTime createdAt,

        @Schema(example = "2026-09-25T10:00:00")
        LocalDateTime updatedAt
) {

    @Schema(name = "MeetingApplication", description = "Candidature the meeting is about")
    public record ApplicationSummary(
            @Schema(example = "1") Long id,
            @Schema(example = "badia@example.com") String candidateEmail,
            @Schema(example = "Java Spring Boot Developer") String jobName) {
    }
}
