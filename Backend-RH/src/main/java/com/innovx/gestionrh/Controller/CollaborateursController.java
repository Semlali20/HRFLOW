package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.EmployeeStatus;
import com.innovx.gestionrh.Service.CollaborateursService;
import com.innovx.gestionrh.Service.ContractAlertService;
import com.innovx.gestionrh.dto.request.CollaborateurRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.CollaborateurResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Employees", description = "Create, read, update, and deactivate employee (collaborateur) records")
@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class CollaborateursController {

    private final CollaborateursService collaborateursService;
    private final ContractAlertService contractAlertService;

    @Operation(summary = "Create employee", description = "Create a new employee record (requires EMPLOYEE_CREATE permission)")
    @PostMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> create(
            @Valid @RequestBody CollaborateurRequest request) {
        CollaborateurResponse created = collaborateursService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @Operation(summary = "List employees", description = "Paginated list of employees with optional full-text search")
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

    @Operation(summary = "Get employee by ID", description = "Fetch a single employee record by its ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.findById(id)));
    }

    @Operation(summary = "List employees by department", description = "Paginated list of employees belonging to a specific department")
    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<PagedResponse<CollaborateurResponse>> findByDepartment(
            @PathVariable Long departmentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(
                collaborateursService.findByDepartment(departmentId, pageable)));
    }

    @Operation(summary = "Update employee", description = "Replace all fields of an employee record")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CollaborateurRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.update(id, request)));
    }

    @Operation(summary = "Update employee status", description = "Change the employment status (ACTIVE, INACTIVE, etc.)")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam EmployeeStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.updateStatus(id, status)));
    }

    @Operation(summary = "Link user account", description = "Associate an employee record with a system user account")
    @PatchMapping("/{id}/link-user/{userId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> linkUser(
            @PathVariable Long id,
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.linkUser(id, userId)));
    }

    @Operation(summary = "Unlink user account", description = "Remove the association between an employee record and its system user account")
    @PatchMapping("/{id}/unlink-user")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborateurResponse>> unlinkUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(collaborateursService.unlinkUser(id)));
    }

    @Operation(summary = "Deactivate employee", description = "Soft-delete (deactivate) an employee record; data is preserved")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        collaborateursService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee deactivated successfully."));
    }

    @Operation(summary = "Get employees with contracts expiring within N days (default 30)")
    @GetMapping("/contracts/expiring")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public ResponseEntity<?> getExpiringContracts(
            @RequestParam(defaultValue = "30") int daysAhead) {
        return ResponseEntity.ok(contractAlertService.getExpiringContracts(daysAhead));
    }
}
