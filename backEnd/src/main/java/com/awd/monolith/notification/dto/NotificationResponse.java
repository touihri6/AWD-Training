package com.awd.monolith.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Notification returned by the API")
public record NotificationResponse(

        @Schema(example = "1")
        Long id,

        @Schema(example = "hr@awd.tn")
        String sender,

        @Schema(example = "badia@example.com")
        String recipient,

        @Schema(example = "Your application has been received.")
        String content,

        @Schema(example = "2026-09-25T10:00:00")
        LocalDateTime date,

        @Schema(description = "Id of the candidature", example = "1")
        Long applicationId,

        @Schema(example = "2026-09-25T10:00:00")
        LocalDateTime createdAt
) {
}
