package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.DocumentCategory;
import com.innovx.gestionrh.Service.DocumentService;
import com.innovx.gestionrh.dto.request.DocumentUploadRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.DocumentResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('DOCUMENT_UPLOAD')")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long employeeId,
            @RequestParam DocumentCategory category,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String expiryDate) {
        DocumentUploadRequest request = new DocumentUploadRequest();
        request.setEmployeeId(employeeId);
        request.setCategory(category);
        request.setDescription(description);
        request.setExpiryDate(expiryDate != null ? java.time.LocalDate.parse(expiryDate) : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(documentService.upload(file, request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCUMENT_READ')")
    public ResponseEntity<ApiResponse<DocumentResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.findById(id)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAuthority('DOCUMENT_READ')")
    public ResponseEntity<PagedResponse<DocumentResponse>> findByEmployee(
            @PathVariable Long employeeId,
            @PageableDefault(size = 20, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(documentService.findByEmployee(employeeId, pageable)));
    }

    @GetMapping("/employee/{employeeId}/category/{category}")
    @PreAuthorize("hasAuthority('DOCUMENT_READ')")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> findByEmployeeAndCategory(
            @PathVariable Long employeeId,
            @PathVariable DocumentCategory category) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.findByEmployeeAndCategory(employeeId, category)));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAuthority('DOCUMENT_READ')")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> findExpiringSoon(
            @RequestParam(defaultValue = "30") int daysAhead) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.findExpiringSoon(daysAhead)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCUMENT_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted successfully."));
    }
}
