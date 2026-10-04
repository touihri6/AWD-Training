package com.awd.monolith.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "Data used to create or update a notification")
public record NotificationRequest(

        @Schema(description = "Sender email", example = "hr@awd.tn")
        @NotBlank(message = "sender is required")
        @Email(message = "sender must be a valid email")
        @Size(max = 150, message = "sender must be at most 150 characters")
        String sender,

        @Schema(description = "Recipient email", example = "badia@example.com")
        @NotBlank(message = "recipient is required")
        @Email(message = "recipient must be a valid email")
        @Size(max = 150, message = "recipient must be at most 150 characters")
        String recipient,

        @Schema(description = "Message content", example = "Your application has been received.")
        @NotBlank(message = "content is required")
        @Size(max = 5000, message = "content must be at most 5000 characters")
        String content,

        @Schema(description = "Notification date (ISO 8601)", example = "2026-09-25T10:00:00", type = "string", format = "date-time")
        @NotNull(message = "date is required")
        LocalDateTime date,

        @Schema(description = "Id of the candidature the notification is about", example = "1")
        @NotNull(message = "applicationId is required")
        Long applicationId
) {
}
