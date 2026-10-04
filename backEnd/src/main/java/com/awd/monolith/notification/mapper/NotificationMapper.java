package com.awd.monolith.notification.mapper;

import com.awd.monolith.notification.dto.NotificationResponse;
import com.awd.monolith.notification.entity.Notification;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getSender(),
                notification.getRecipient(),
                notification.getContent(),
                notification.getDate(),
                notification.getApplication().getId(),
                notification.getCreatedAt());
    }
}
