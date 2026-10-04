package com.awd.monolith.meeting.entity;

import java.util.Set;

public enum MeetingStatus {
    SCHEDULED,
    HELD,
    CANCELLED;

    public boolean canMoveTo(MeetingStatus target) {
        return this == target || (this == SCHEDULED && Set.of(HELD, CANCELLED).contains(target));
    }
}
