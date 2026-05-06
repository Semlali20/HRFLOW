package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.InternStatus;
import com.innovx.gestionrh.Service.InternService;
import com.innovx.gestionrh.dto.request.InternDocumentRequest;
import com.innovx.gestionrh.dto.request.InternRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.InternDocumentResponse;
import com.innovx.gestionrh.dto.response.InternResponse;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/interns")
@RequiredArgsConstructor
public class StagiaireController {

    private final InternService internService;

    @PostMapping
    @PreAuthorize("hasAuthority('INTERN_CREATE')")
    public ResponseEntity<ApiResponse<InternResponse>> create(
            @Valid @RequestBody InternRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(internService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INTERN_READ')")
    public ResponseEntity<PagedResponse<InternResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) InternStatus status,
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {
        var page = (search != null && !search.isBlank())
                ? internService.search(search, pageable)
                : (status != null)
                        ? internService.findByStatus(status, pageable)
                        : internService.findAll(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INTERN_READ')")
    public ResponseEntity<ApiResponse<InternResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(internService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INTERN_UPDATE')")
    public ResponseEntity<ApiResponse<InternResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InternRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(internService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('INTERN_UPDATE')")
    public ResponseEntity<ApiResponse<InternResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam InternStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(internService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INTERN_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        internService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Intern record deactivated successfully."));
    }

    // ── Documents ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAuthority('INTERN_READ')")
    public ResponseEntity<ApiResponse<List<InternDocumentResponse>>> getDocuments(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(internService.getDocuments(id)));
    }

    @PutMapping("/{id}/documents")
    @PreAuthorize("hasAuthority('INTERN_UPDATE')")
    public ResponseEntity<ApiResponse<InternDocumentResponse>> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody InternDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(internService.updateDocument(id, request)));
    }
}
