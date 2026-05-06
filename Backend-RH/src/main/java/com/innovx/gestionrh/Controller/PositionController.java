package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.PositionService;
import com.innovx.gestionrh.dto.request.PositionRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import com.innovx.gestionrh.dto.response.PositionResponse;
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
@RequestMapping("/api/v1/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @PostMapping
    @PreAuthorize("hasAuthority('POSITION_CREATE')")
    public ResponseEntity<ApiResponse<PositionResponse>> create(
            @Valid @RequestBody PositionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(positionService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('POSITION_READ')")
    public ResponseEntity<PagedResponse<PositionResponse>> findAll(
            @PageableDefault(size = 20, sort = "title", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(positionService.findAll(pageable)));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAuthority('POSITION_READ')")
    public ResponseEntity<ApiResponse<List<PositionResponse>>> findByDepartment(
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(ApiResponse.ok(positionService.findByDepartment(departmentId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('POSITION_READ')")
    public ResponseEntity<ApiResponse<PositionResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(positionService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('POSITION_UPDATE')")
    public ResponseEntity<ApiResponse<PositionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PositionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(positionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('POSITION_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        positionService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Position deleted successfully."));
    }
}
