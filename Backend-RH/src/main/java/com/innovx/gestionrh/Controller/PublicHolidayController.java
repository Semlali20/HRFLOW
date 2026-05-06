package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.PublicHolidayService;
import com.innovx.gestionrh.dto.request.PublicHolidayRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.PublicHolidayResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public-holidays")
@RequiredArgsConstructor
public class PublicHolidayController {

    private final PublicHolidayService publicHolidayService;

    @PostMapping
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<PublicHolidayResponse>> create(
            @Valid @RequestBody PublicHolidayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(publicHolidayService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<List<PublicHolidayResponse>>> findAll(
            @RequestParam(required = false) String countryCode) {
        return ResponseEntity.ok(ApiResponse.ok(publicHolidayService.findAll(countryCode)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<PublicHolidayResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PublicHolidayRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(publicHolidayService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        publicHolidayService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Public holiday deleted successfully."));
    }
}
