package com.awd.monolith.meeting.dto;

import com.awd.monolith.meeting.entity.MeetingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "New status of a meeting")
public record MeetingStatusRequest(

        @Schema(description = "SCHEDULED can move to HELD or CANCELLED; HELD and CANCELLED are final", example = "HELD")
        @NotNull(message = "status is required")
        MeetingStatus status
) {
}
