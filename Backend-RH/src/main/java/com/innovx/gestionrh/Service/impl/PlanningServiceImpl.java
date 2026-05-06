package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.PlanningEvent;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.PlanningEventRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.PlanningService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.PlanningEventRequest;
import com.innovx.gestionrh.dto.response.PlanningEventResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.PlanningMapper;
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
public class PlanningServiceImpl implements PlanningService {

    private final PlanningEventRepository planningEventRepository;
    private final UserRepository userRepository;
    private final PlanningMapper planningMapper;

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "PLANNING")
    public PlanningEventResponse create(PlanningEventRequest request, Long creatorId) {
        validateEventDates(request.getStartDateTime(), request.getEndDateTime());

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", creatorId));

        PlanningEvent event = planningMapper.toEntity(request);
        event.setCreatedBy(creator);
        resolveAttendees(event, request);

        return planningMapper.toResponse(planningEventRepository.save(event));
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "PLANNING")
    public PlanningEventResponse update(Long id, PlanningEventRequest request) {
        PlanningEvent event = findEntityById(id);

        validateEventDates(request.getStartDateTime(), request.getEndDateTime());
        planningMapper.updateEntity(request, event);
        resolveAttendees(event, request);

        return planningMapper.toResponse(planningEventRepository.save(event));
    }

    @Override
    public PlanningEventResponse findById(Long id) {
        return planningMapper.toResponse(findEntityById(id));
    }

    @Override
    public Page<PlanningEventResponse> findAll(Pageable pageable) {
        return planningEventRepository.findAll(pageable).map(planningMapper::toResponse);
    }

    @Override
    public List<PlanningEventResponse> findByDateRange(LocalDateTime from, LocalDateTime to) {
        if (from == null || to == null) {
            throw new BusinessException("INVALID_DATE_RANGE",
                    "Both 'from' and 'to' date-time parameters are required.");
        }
        if (to.isBefore(from)) {
            throw new BusinessException("INVALID_DATE_RANGE",
                    "'to' must be after 'from'.");
        }
        return planningEventRepository.findByDateRange(from, to)
                .stream().map(planningMapper::toResponse).toList();
    }

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "PLANNING")
    public void delete(Long id) {
        PlanningEvent event = findEntityById(id);
        planningEventRepository.delete(event);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private PlanningEvent findEntityById(Long id) {
        return planningEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlanningEvent", "id", id));
    }

    private void validateEventDates(LocalDateTime start, LocalDateTime end) {
        if (start == null) {
            throw new BusinessException("MISSING_START",
                    "Event start date-time is required.");
        }
        if (end != null && end.isBefore(start)) {
            throw new BusinessException("INVALID_DATE_RANGE",
                    "Event end date-time must be after start date-time.");
        }
    }

    private void resolveAttendees(PlanningEvent event, PlanningEventRequest request) {
        if (request.getAttendeeIds() != null && !request.getAttendeeIds().isEmpty()) {
            Set<User> attendees = new HashSet<>();
            for (Long attendeeId : request.getAttendeeIds()) {
                attendees.add(
                        userRepository.findById(attendeeId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "User (attendee)", "id", attendeeId)));
            }
            event.setAttendees(attendees);
        }
    }
}
