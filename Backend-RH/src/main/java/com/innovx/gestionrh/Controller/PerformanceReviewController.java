package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.PerformanceReviewService;
import com.innovx.gestionrh.dto.request.PerformanceReviewRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import com.innovx.gestionrh.dto.response.PerformanceReviewResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/performance-reviews")
@RequiredArgsConstructor
public class PerformanceReviewController {

    private final PerformanceReviewService service;

    @GetMapping
    @PreAuthorize("hasAuthority('PERFORMANCE_READ')")
    public ResponseEntity<PagedResponse<PerformanceReviewResponse>> getAll(
            @PageableDefault(size = 20, sort = "reviewDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(service.getAll(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERFORMANCE_READ')")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @GetMapping("/collaborateur/{collaborateurId}")
    @PreAuthorize("hasAuthority('PERFORMANCE_READ')")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> getByCollaborateur(
            @PathVariable Long collaborateurId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getByCollaborateur(collaborateurId)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERFORMANCE_WRITE')")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> create(
            @Valid @RequestBody PerformanceReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(service.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERFORMANCE_WRITE')")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PerformanceReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, request)));
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('PERFORMANCE_WRITE')")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> submit(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.submit(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERFORMANCE_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Performance review deleted successfully."));
    }
}
