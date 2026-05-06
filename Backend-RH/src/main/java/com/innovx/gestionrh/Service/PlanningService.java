package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.PlanningEventRequest;
import com.innovx.gestionrh.dto.response.PlanningEventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface PlanningService {

    PlanningEventResponse create(PlanningEventRequest request, Long creatorId);

    PlanningEventResponse update(Long id, PlanningEventRequest request);

    PlanningEventResponse findById(Long id);

    Page<PlanningEventResponse> findAll(Pageable pageable);

    List<PlanningEventResponse> findByDateRange(LocalDateTime from, LocalDateTime to);

    void delete(Long id);
}
