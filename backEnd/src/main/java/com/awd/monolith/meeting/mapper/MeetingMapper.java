package com.awd.monolith.meeting.mapper;

import com.awd.monolith.candidature.entity.Application;
import com.awd.monolith.meeting.dto.MeetingResponse;
import com.awd.monolith.meeting.entity.Meeting;

public final class MeetingMapper {

    private MeetingMapper() {
    }

    public static MeetingResponse toResponse(Meeting meeting) {
        Application a = meeting.getApplication();
        return new MeetingResponse(
                meeting.getId(),
                meeting.getReference(),
                meeting.getLink(),
                meeting.getStatus(),
                new MeetingResponse.ApplicationSummary(a.getId(), a.getCandidate().getEmail(), a.getJob().getName()),
                meeting.getCreatedAt(),
                meeting.getUpdatedAt());
    }
}
