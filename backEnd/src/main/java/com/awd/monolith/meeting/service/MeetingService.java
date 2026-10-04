package com.awd.monolith.meeting.service;

import com.awd.monolith.candidature.entity.Application;
import com.awd.monolith.candidature.service.ApplicationService;
import com.awd.monolith.common.exception.ConflictException;
import com.awd.monolith.common.exception.ResourceNotFoundException;
import com.awd.monolith.meeting.dto.MeetingRequest;
import com.awd.monolith.meeting.dto.MeetingResponse;
import com.awd.monolith.meeting.entity.Meeting;
import com.awd.monolith.meeting.entity.MeetingStatus;
import com.awd.monolith.meeting.mapper.MeetingMapper;
import com.awd.monolith.meeting.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ApplicationService applicationService;

    public MeetingService(MeetingRepository meetingRepository, ApplicationService applicationService) {
        this.meetingRepository = meetingRepository;
        this.applicationService = applicationService;
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> search(MeetingStatus status) {
        return meetingRepository.search(status).stream().map(MeetingMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MeetingResponse findById(Long id) {
        return MeetingMapper.toResponse(getMeeting(id));
    }

    public MeetingResponse create(MeetingRequest request) {
        if (meetingRepository.existsByReference(request.reference())) {
            throw new ConflictException("Reference " + request.reference() + " is already used by another meeting");
        }
        Application application = applicationService.getApplication(request.applicationId());
        if (meetingRepository.existsByApplicationId(application.getId())) {
            throw new ConflictException("Application " + application.getId() + " already has a meeting");
        }

        Meeting meeting = new Meeting();
        apply(meeting, request, application);
        meeting.setStatus(request.status() != null ? request.status() : MeetingStatus.SCHEDULED);
        return MeetingMapper.toResponse(meetingRepository.saveAndFlush(meeting));
    }

    public MeetingResponse update(Long id, MeetingRequest request) {
        Meeting meeting = getMeeting(id);
        MeetingStatus status = request.status() != null ? request.status() : meeting.getStatus();
        checkTransition(meeting.getStatus(), status);

        if (meetingRepository.existsByReferenceAndIdNot(request.reference(), id)) {
            throw new ConflictException("Reference " + request.reference() + " is already used by another meeting");
        }
        Application application = applicationService.getApplication(request.applicationId());
        if (meetingRepository.existsByApplicationIdAndIdNot(application.getId(), id)) {
            throw new ConflictException("Application " + application.getId() + " already has a meeting");
        }

        apply(meeting, request, application);
        meeting.setStatus(status);
        return MeetingMapper.toResponse(meetingRepository.saveAndFlush(meeting));
    }

    public MeetingResponse updateStatus(Long id, MeetingStatus status) {
        Meeting meeting = getMeeting(id);
        checkTransition(meeting.getStatus(), status);
        meeting.setStatus(status);
        return MeetingMapper.toResponse(meetingRepository.saveAndFlush(meeting));
    }

    public void delete(Long id) {
        meetingRepository.delete(getMeeting(id));
    }

    private void checkTransition(MeetingStatus from, MeetingStatus to) {
        if (!from.canMoveTo(to)) {
            throw new ConflictException("Status transition not allowed: " + from + " -> " + to);
        }
    }

    private void apply(Meeting meeting, MeetingRequest request, Application application) {
        meeting.setReference(request.reference().trim());
        meeting.setLink(request.link() == null || request.link().isBlank() ? null : request.link());
        meeting.setApplication(application);
    }

    private Meeting getMeeting(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting", id));
    }
}
