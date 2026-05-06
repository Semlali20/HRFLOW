package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.MeetingService;
import com.innovx.gestionrh.dto.request.MeetingRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.MeetingResponse;
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
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    @PreAuthorize("hasAuthority('MEETING_CREATE')")
    public ResponseEntity<ApiResponse<MeetingResponse>> create(
            @Valid @RequestBody MeetingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(meetingService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MEETING_READ')")
    public ResponseEntity<PagedResponse<MeetingResponse>> findAll(
            @PageableDefault(size = 20, sort = "scheduledDate", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(meetingService.findAll(pageable)));
    }

    @GetMapping("/intern/{internId}")
    @PreAuthorize("hasAuthority('MEETING_READ')")
    public ResponseEntity<ApiResponse<List<MeetingResponse>>> findByIntern(@PathVariable Long internId) {
        return ResponseEntity.ok(ApiResponse.ok(meetingService.findByIntern(internId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MEETING_READ')")
    public ResponseEntity<ApiResponse<MeetingResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(meetingService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MEETING_UPDATE')")
    public ResponseEntity<ApiResponse<MeetingResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MeetingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(meetingService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MEETING_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        meetingService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Meeting deleted successfully."));
    }
}
