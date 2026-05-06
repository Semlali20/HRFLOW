package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.StageOffer.OfferStatus;
import com.innovx.gestionrh.Service.StageOfferService;
import com.innovx.gestionrh.dto.request.StageOfferRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import com.innovx.gestionrh.dto.response.StageOfferResponse;
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
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class StageOfferController {

    private final StageOfferService stageOfferService;

    @PostMapping
    @PreAuthorize("hasAuthority('OFFER_CREATE')")
    public ResponseEntity<ApiResponse<StageOfferResponse>> create(
            @Valid @RequestBody StageOfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(stageOfferService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<PagedResponse<StageOfferResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OfferStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        var page = (search != null && !search.isBlank())
                ? stageOfferService.search(search, pageable)
                : (status != null)
                        ? stageOfferService.findByStatus(status, pageable)
                        : stageOfferService.findAll(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<ApiResponse<StageOfferResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(stageOfferService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('OFFER_MANAGE')")
    public ResponseEntity<ApiResponse<StageOfferResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody StageOfferRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(stageOfferService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('OFFER_MANAGE')")
    public ResponseEntity<ApiResponse<StageOfferResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam OfferStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(stageOfferService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('OFFER_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        stageOfferService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Stage offer deleted successfully."));
    }
}
