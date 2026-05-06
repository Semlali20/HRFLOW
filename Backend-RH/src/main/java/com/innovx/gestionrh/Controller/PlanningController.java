package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.PlanningService;
import com.innovx.gestionrh.dto.request.PlanningEventRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import com.innovx.gestionrh.dto.response.PlanningEventResponse;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService planningService;

    @PostMapping
    @PreAuthorize("hasAuthority('PLANNING_CREATE')")
    public ResponseEntity<ApiResponse<PlanningEventResponse>> create(
            @Valid @RequestBody PlanningEventRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(planningService.create(request, currentUser.getId())));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PLANNING_READ')")
    public ResponseEntity<PagedResponse<PlanningEventResponse>> findAll(
            @PageableDefault(size = 50, sort = "startDateTime", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(planningService.findAll(pageable)));
    }

    @GetMapping("/range")
    @PreAuthorize("hasAuthority('PLANNING_READ')")
    public ResponseEntity<ApiResponse<List<PlanningEventResponse>>> findByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.ok(planningService.findByDateRange(from, to)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PLANNING_READ')")
    public ResponseEntity<ApiResponse<PlanningEventResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(planningService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PLANNING_UPDATE')")
    public ResponseEntity<ApiResponse<PlanningEventResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PlanningEventRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(planningService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PLANNING_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        planningService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Planning event deleted successfully."));
    }
}
