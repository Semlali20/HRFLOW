package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.OnboardingService;
import com.innovx.gestionrh.dto.request.OnboardingProcessRequest;
import com.innovx.gestionrh.dto.response.OnboardingProcessResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding", description = "Employee onboarding and offboarding workflow")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE') or hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<OnboardingProcessResponse> start(@Valid @RequestBody OnboardingProcessRequest req) {
        return ResponseEntity.status(201).body(onboardingService.start(req));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<Page<OnboardingProcessResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(onboardingService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<OnboardingProcessResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(onboardingService.getById(id));
    }

    @GetMapping("/employee/{collaborateurId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<List<OnboardingProcessResponse>> getByEmployee(@PathVariable Long collaborateurId) {
        return ResponseEntity.ok(onboardingService.getByCollaborateur(collaborateurId));
    }

    @PatchMapping("/{processId}/tasks/{taskId}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OnboardingProcessResponse> completeTask(
            @PathVariable Long processId, @PathVariable Long taskId,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(onboardingService.completeTask(processId, taskId, notes));
    }

    @PatchMapping("/{processId}/tasks/{taskId}/uncomplete")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<OnboardingProcessResponse> uncompleteTask(@PathVariable Long processId, @PathVariable Long taskId) {
        return ResponseEntity.ok(onboardingService.uncompleteTask(processId, taskId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        onboardingService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
