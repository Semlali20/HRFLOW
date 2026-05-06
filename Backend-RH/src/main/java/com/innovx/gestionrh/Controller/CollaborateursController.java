package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.EmployeeStatus;
import com.innovx.gestionrh.Service.CollaborateursService;
import com.innovx.gestionrh.dto.request.CollaborateurRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.CollaborateurResponse;
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

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class CollaborateursController {

    private final CollaborateursService collaborateursService;

    @PostMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> create(
            @Valid @RequestBody CollaborateurRequest request) {
        CollaborateurResponse created = collaborateursService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<PagedResponse<CollaborateurResponse>> findAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {
        var page = (search != null && !search.isBlank())
                ? collaborateursService.search(search, pageable)
                : collaborateursService.findAll(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.findById(id)));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<PagedResponse<CollaborateurResponse>> findByDepartment(
            @PathVariable Long departmentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(
                collaborateursService.findByDepartment(departmentId, pageable)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CollaborateurRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam EmployeeStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.updateStatus(id, status)));
    }

    @PatchMapping("/{id}/link-user/{userId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> linkUser(
            @PathVariable Long id,
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.linkUser(id, userId)));
    }

    @PatchMapping("/{id}/unlink-user")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> unlinkUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.unlinkUser(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        collaborateursService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee deactivated successfully."));
    }
}
