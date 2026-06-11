package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.OnboardingProcessRequest;
import com.innovx.gestionrh.dto.response.OnboardingProcessResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OnboardingService {
    OnboardingProcessResponse start(OnboardingProcessRequest req);
    OnboardingProcessResponse getById(Long id);
    Page<OnboardingProcessResponse> getAll(Pageable pageable);
    List<OnboardingProcessResponse> getByCollaborateur(Long collaborateurId);
    OnboardingProcessResponse completeTask(Long processId, Long taskId, String notes);
    OnboardingProcessResponse uncompleteTask(Long processId, Long taskId);
    void cancel(Long id);
}
