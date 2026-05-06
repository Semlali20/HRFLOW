package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.*;
import com.innovx.gestionrh.Repository.*;
import com.innovx.gestionrh.Service.MeetingService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.MeetingRequest;
import com.innovx.gestionrh.dto.response.MeetingResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.MeetingMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final StagiairesRepository stagiaireRepository;
    private final MeetingMapper meetingMapper;

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "MEETING")
    public MeetingResponse create(MeetingRequest request) {
        validateScheduledAt(request.getScheduledAt());

        Meeting meeting = meetingMapper.toEntity(request);
        resolveRelations(meeting, request);

        return meetingMapper.toResponse(meetingRepository.save(meeting));
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "MEETING")
    public MeetingResponse update(Long id, MeetingRequest request) {
        Meeting meeting = findEntityById(id);

        if (meeting.getStatus() == MeetingStatus.COMPLETED
                || meeting.getStatus() == MeetingStatus.CANCELLED) {
            throw new BusinessException("MEETING_CLOSED",
                    "Cannot modify a " + meeting.getStatus() + " meeting.");
        }

        validateScheduledAt(request.getScheduledAt());
        meetingMapper.updateEntity(request, meeting);
        resolveRelations(meeting, request);

        return meetingMapper.toResponse(meetingRepository.save(meeting));
    }

    @Override
    public MeetingResponse findById(Long id) {
        return meetingMapper.toResponse(findEntityById(id));
    }

    @Override
    public Page<MeetingResponse> findAll(Pageable pageable) {
        return meetingRepository.findAll(pageable).map(meetingMapper::toResponse);
    }

    @Override
    public List<MeetingResponse> findByIntern(Long internId) {
        if (!stagiaireRepository.existsById(internId)) {
            throw new ResourceNotFoundException("Intern", "id", internId);
        }
        return meetingRepository.findByInternId(internId)
                .stream().map(meetingMapper::toResponse).toList();
    }

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "MEETING")
    public void delete(Long id) {
        Meeting meeting = findEntityById(id);
        if (meeting.getStatus() == MeetingStatus.COMPLETED) {
            throw new BusinessException("MEETING_COMPLETED",
                    "Completed meetings cannot be deleted to preserve the audit trail.");
        }
        meetingRepository.delete(meeting);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Meeting findEntityById(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting", "id", id));
    }

    private void validateScheduledAt(LocalDateTime scheduledAt) {
        if (scheduledAt == null) {
            throw new BusinessException("MISSING_SCHEDULE",
                    "Scheduled date and time are required.");
        }
        if (scheduledAt.isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new BusinessException("SCHEDULE_IN_PAST",
                    "Meeting cannot be scheduled in the past.");
        }
    }

    private void resolveRelations(Meeting meeting, MeetingRequest request) {
        if (request.getOrganizerId() != null) {
            User organizer = userRepository.findById(request.getOrganizerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User (organizer)", "id", request.getOrganizerId()));
            meeting.setOrganizer(organizer);
        }

        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            Set<User> participants = new HashSet<>();
            for (Long participantId : request.getParticipantIds()) {
                participants.add(
                        userRepository.findById(participantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "User (participant)", "id", participantId)));
            }
            meeting.setParticipants(participants);
        }

        if (request.getInternId() != null) {
            Stagiaires intern = stagiaireRepository.findById(request.getInternId())
                    .orElseThrow(() -> new ResourceNotFoundException("Intern", "id", request.getInternId()));
            meeting.setIntern(intern);
        }
    }
}
