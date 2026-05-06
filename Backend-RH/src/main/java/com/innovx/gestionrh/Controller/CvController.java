package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.CvApplication.KanbanStage;
import com.innovx.gestionrh.Service.CvService;
import com.innovx.gestionrh.dto.request.KanbanStageUpdateRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.CvApplicationResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/cvs")
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;

    // ── Applications ───────────────────────────────────────────────────────────

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('CV_UPLOAD')")
    public ResponseEntity<ApiResponse<CvApplicationResponse>> upload(
            @RequestParam Long offerId,
            @RequestParam String candidateName,
            @RequestParam String candidateEmail,
            @RequestParam(required = false) String candidatePhone,
            @RequestParam("file") MultipartFile cvFile) {
        CvApplicationResponse response = cvService.apply(offerId, candidateName, candidateEmail,
                candidatePhone, cvFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @GetMapping("/applications")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<PagedResponse<CvApplicationResponse>> findAll(
            @PageableDefault(size = 20, sort = "submittedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(cvService.findAll(pageable)));
    }

    @GetMapping("/applications/{id}")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<ApiResponse<CvApplicationResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(cvService.findById(id)));
    }

    @GetMapping("/applications/offer/{offerId}")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<PagedResponse<CvApplicationResponse>> findByOffer(
            @PathVariable Long offerId,
            @PageableDefault(size = 20, sort = "submittedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(cvService.findByOffer(offerId, pageable)));
    }

    @GetMapping("/applications/stage/{stage}")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<PagedResponse<CvApplicationResponse>> findByStage(
            @PathVariable KanbanStage stage,
            @PageableDefault(size = 20, sort = "submittedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(cvService.findByStage(stage, pageable)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<PagedResponse<CvApplicationResponse>> search(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(cvService.searchByText(keyword, pageable)));
    }

    @PatchMapping("/applications/{id}/stage")
    @PreAuthorize("hasAuthority('CV_SHORTLIST')")
    public ResponseEntity<ApiResponse<CvApplicationResponse>> updateStage(
            @PathVariable Long id,
            @Valid @RequestBody KanbanStageUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(cvService.updateStage(id, request)));
    }

    @PatchMapping("/applications/{id}/score")
    @PreAuthorize("hasAuthority('CV_SHORTLIST')")
    public ResponseEntity<ApiResponse<CvApplicationResponse>> updateScore(
            @PathVariable Long id,
            @RequestParam Integer score,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.ok(cvService.updateScore(id, score, notes)));
    }

    @DeleteMapping("/applications/{id}")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        cvService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("CV application deleted successfully."));
    }
}
