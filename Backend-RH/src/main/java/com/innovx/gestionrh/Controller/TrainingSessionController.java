package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.dto.request.TrainingSessionRequest;
import com.innovx.gestionrh.dto.response.TrainingSessionResponse;
import com.innovx.gestionrh.Service.TrainingSessionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trainings")
@RequiredArgsConstructor
@Tag(name = "Training & Development", description = "Training session management")
public class TrainingSessionController {

    private final TrainingSessionService service;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<TrainingSessionResponse>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TrainingSessionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/participant/{collabId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TrainingSessionResponse>> getByParticipant(@PathVariable Long collabId) {
        return ResponseEntity.ok(service.getByParticipant(collabId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('TRAINING_WRITE')")
    public ResponseEntity<TrainingSessionResponse> create(
            @Valid @RequestBody TrainingSessionRequest request) {
        return ResponseEntity.status(201).body(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TRAINING_WRITE')")
    public ResponseEntity<TrainingSessionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TrainingSessionRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/enroll/{collabId}")
    @PreAuthorize("hasAuthority('TRAINING_WRITE')")
    public ResponseEntity<TrainingSessionResponse> enroll(
            @PathVariable Long id,
            @PathVariable Long collabId) {
        return ResponseEntity.ok(service.enroll(id, collabId));
    }

    @PatchMapping("/{id}/unenroll/{collabId}")
    @PreAuthorize("hasAuthority('TRAINING_WRITE')")
    public ResponseEntity<TrainingSessionResponse> unenroll(
            @PathVariable Long id,
            @PathVariable Long collabId) {
        return ResponseEntity.ok(service.unenroll(id, collabId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('TRAINING_WRITE')")
    public ResponseEntity<TrainingSessionResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TRAINING_WRITE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
