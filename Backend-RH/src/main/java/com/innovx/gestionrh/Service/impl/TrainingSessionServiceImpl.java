package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.dto.request.TrainingSessionRequest;
import com.innovx.gestionrh.dto.response.TrainingSessionResponse;
import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.TrainingSession;
import com.innovx.gestionrh.Entity.TrainingSession.TrainingStatus;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.TrainingSessionRepository;
import com.innovx.gestionrh.Service.TrainingSessionService;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrainingSessionServiceImpl implements TrainingSessionService {

    private final TrainingSessionRepository trainingRepo;
    private final CollaborateursRepository  collabRepo;

    @Override
    @Transactional
    public TrainingSessionResponse create(TrainingSessionRequest req) {
        Set<Collaborateurs> participants = resolveParticipants(req.getParticipantIds());
        TrainingSession t = TrainingSession.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .category(req.getCategory())
            .startDate(req.getStartDate())
            .endDate(req.getEndDate())
            .location(req.getLocation())
            .trainerName(req.getTrainerName())
            .maxParticipants(req.getMaxParticipants())
            .cost(req.getCost())
            .status(TrainingStatus.PLANNED)
            .participants(participants)
            .build();
        return toResponse(trainingRepo.save(t));
    }

    @Override
    @Transactional
    public TrainingSessionResponse update(Long id, TrainingSessionRequest req) {
        TrainingSession t = find(id);
        t.setTitle(req.getTitle());
        t.setDescription(req.getDescription());
        t.setCategory(req.getCategory());
        t.setStartDate(req.getStartDate());
        t.setEndDate(req.getEndDate());
        t.setLocation(req.getLocation());
        t.setTrainerName(req.getTrainerName());
        t.setMaxParticipants(req.getMaxParticipants());
        t.setCost(req.getCost());
        return toResponse(trainingRepo.save(t));
    }

    @Override
    public TrainingSessionResponse getById(Long id) {
        return toResponse(find(id));
    }

    @Override
    public Page<TrainingSessionResponse> getAll(Pageable pageable) {
        return trainingRepo.findAll(pageable).map(this::toResponse);
    }

    @Override
    public List<TrainingSessionResponse> getByParticipant(Long collaborateurId) {
        return trainingRepo.findByParticipantId(collaborateurId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TrainingSessionResponse enroll(Long trainingId, Long collaborateurId) {
        TrainingSession t = find(trainingId);
        if (t.getMaxParticipants() != null && t.getParticipants().size() >= t.getMaxParticipants()) {
            throw new BusinessException("Training session is full");
        }
        Collaborateurs c = collabRepo.findById(collaborateurId)
            .orElseThrow(() -> new ResourceNotFoundException("Collaborateur not found with id: " + collaborateurId));
        t.getParticipants().add(c);
        return toResponse(trainingRepo.save(t));
    }

    @Override
    @Transactional
    public TrainingSessionResponse unenroll(Long trainingId, Long collaborateurId) {
        TrainingSession t = find(trainingId);
        t.getParticipants().removeIf(p -> p.getId().equals(collaborateurId));
        return toResponse(trainingRepo.save(t));
    }

    @Override
    @Transactional
    public TrainingSessionResponse updateStatus(Long id, String status) {
        TrainingSession t = find(id);
        try {
            t.setStatus(TrainingStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid training status: " + status);
        }
        return toResponse(trainingRepo.save(t));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!trainingRepo.existsById(id)) {
            throw new ResourceNotFoundException("TrainingSession not found with id: " + id);
        }
        trainingRepo.deleteById(id);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private TrainingSession find(Long id) {
        return trainingRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("TrainingSession not found with id: " + id));
    }

    private Set<Collaborateurs> resolveParticipants(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return new HashSet<>(collabRepo.findAllById(ids));
    }

    private TrainingSessionResponse toResponse(TrainingSession t) {
        List<String> names = t.getParticipants().stream()
            .map(p -> p.getFirstName() + " " + p.getLastName())
            .collect(Collectors.toList());
        Set<Long> ids = t.getParticipants().stream()
            .map(Collaborateurs::getId)
            .collect(Collectors.toSet());

        TrainingSessionResponse r = new TrainingSessionResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setCategory(t.getCategory());
        r.setStartDate(t.getStartDate());
        r.setEndDate(t.getEndDate());
        r.setLocation(t.getLocation());
        r.setTrainerName(t.getTrainerName());
        r.setMaxParticipants(t.getMaxParticipants());
        r.setCost(t.getCost());
        r.setStatus(t.getStatus());
        r.setParticipantIds(ids);
        r.setParticipantNames(names);
        r.setParticipantCount(t.getParticipants().size());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        return r;
    }
}
