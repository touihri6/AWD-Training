package com.awd.monolith.meeting.dto;

import com.awd.monolith.meeting.entity.MeetingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Data used to create or update a meeting")
public record MeetingRequest(

        @Schema(description = "Unique meeting reference", example = "MEET-2026-001")
        @NotBlank(message = "reference is required")
        @Size(min = 2, max = 50, message = "reference must be between 2 and 50 characters")
        String reference,

        @Schema(description = "Video-conference link", example = "https://meet.example.com/abc-defg-hij", nullable = true)
        @Size(max = 500, message = "link must be at most 500 characters")
        @Pattern(regexp = "^$|^https?://\\S+$", message = "link must be a valid URL")
        String link,

        @Schema(description = "Meeting status. Defaults to SCHEDULED on creation.", example = "SCHEDULED", nullable = true)
        MeetingStatus status,

        @Schema(description = "Id of the candidature the meeting is about", example = "1")
        @NotNull(message = "applicationId is required")
        Long applicationId
) {
}
