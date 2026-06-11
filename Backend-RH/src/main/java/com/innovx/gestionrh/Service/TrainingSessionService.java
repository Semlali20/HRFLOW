package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.TrainingSessionRequest;
import com.innovx.gestionrh.dto.response.TrainingSessionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TrainingSessionService {

    TrainingSessionResponse create(TrainingSessionRequest request);

    TrainingSessionResponse update(Long id, TrainingSessionRequest request);

    TrainingSessionResponse getById(Long id);

    Page<TrainingSessionResponse> getAll(Pageable pageable);

    List<TrainingSessionResponse> getByParticipant(Long collaborateurId);

    TrainingSessionResponse enroll(Long trainingId, Long collaborateurId);

    TrainingSessionResponse unenroll(Long trainingId, Long collaborateurId);

    TrainingSessionResponse updateStatus(Long id, String status);

    void delete(Long id);
}
