package com.awd.monolith.notification.service;

import com.awd.monolith.candidature.entity.Application;
import com.awd.monolith.candidature.service.ApplicationService;
import com.awd.monolith.common.exception.ConflictException;
import com.awd.monolith.common.exception.ResourceNotFoundException;
import com.awd.monolith.notification.dto.NotificationRequest;
import com.awd.monolith.notification.dto.NotificationResponse;
import com.awd.monolith.notification.entity.Notification;
import com.awd.monolith.notification.mapper.NotificationMapper;
import com.awd.monolith.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ApplicationService applicationService;

    public NotificationService(NotificationRepository notificationRepository, ApplicationService applicationService) {
        this.notificationRepository = notificationRepository;
        this.applicationService = applicationService;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> search(String recipient) {
        return notificationRepository.search(recipient).stream().map(NotificationMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public NotificationResponse findById(Long id) {
        return NotificationMapper.toResponse(getNotification(id));
    }

    public NotificationResponse create(NotificationRequest request) {
        Application application = applicationService.getApplication(request.applicationId());
        if (notificationRepository.existsByApplicationId(application.getId())) {
            throw new ConflictException("Application " + application.getId() + " already has a notification");
        }

        Notification notification = new Notification();
        apply(notification, request, application);
        return NotificationMapper.toResponse(notificationRepository.saveAndFlush(notification));
    }

    public NotificationResponse update(Long id, NotificationRequest request) {
        Notification notification = getNotification(id);
        Application application = applicationService.getApplication(request.applicationId());
        if (notificationRepository.existsByApplicationIdAndIdNot(application.getId(), id)) {
            throw new ConflictException("Application " + application.getId() + " already has a notification");
        }

        apply(notification, request, application);
        return NotificationMapper.toResponse(notificationRepository.saveAndFlush(notification));
    }

    public void delete(Long id) {
        notificationRepository.delete(getNotification(id));
    }

    private void apply(Notification notification, NotificationRequest request, Application application) {
        notification.setSender(request.sender().trim().toLowerCase());
        notification.setRecipient(request.recipient().trim().toLowerCase());
        notification.setContent(request.content().trim());
        notification.setDate(request.date());
        notification.setApplication(application);
    }

    private Notification getNotification(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
    }
}
