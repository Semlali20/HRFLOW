package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.CvApplication;
import com.innovx.gestionrh.Entity.CvApplication.KanbanStage;
import com.innovx.gestionrh.Entity.StageOffer;
import com.innovx.gestionrh.Repository.CvApplicationRepository;
import com.innovx.gestionrh.Repository.StageOfferRepository;
import com.innovx.gestionrh.Service.FileSearchService;
import com.innovx.gestionrh.Service.FileStorageService;
import com.innovx.gestionrh.annotation.LogActivity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cvs")
@RequiredArgsConstructor
public class CvController {

    private final FileSearchService fileSearchService;
    private final FileStorageService fileStorageService;
    private final CvApplicationRepository applicationRepository;
    private final StageOfferRepository offerRepository;

    /* ====================== Stage Offers ====================== */

    @GetMapping("/offers")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<List<StageOffer>> getOpenOffers() {
        return ResponseEntity.ok(offerRepository.findByStatus(StageOffer.OfferStatus.OPEN));
    }

    @GetMapping("/offers/all")
    @PreAuthorize("hasAuthority('OFFER_MANAGE')")
    public ResponseEntity<List<StageOffer>> getAllOffers() {
        return ResponseEntity.ok(offerRepository.findAll());
    }

    @PostMapping("/offers")
    @PreAuthorize("hasAuthority('OFFER_CREATE')")
    @LogActivity(action = "CREATE", module = "CV", description = "Created stage offer")
    public ResponseEntity<StageOffer> createOffer(@RequestBody StageOffer offer) {
        return ResponseEntity.ok(offerRepository.save(offer));
    }

    @PutMapping("/offers/{id}")
    @PreAuthorize("hasAuthority('OFFER_MANAGE')")
    public ResponseEntity<StageOffer> updateOffer(@PathVariable Long id, @RequestBody StageOffer updated) {
        return offerRepository.findById(id).map(offer -> {
            offer.setTitle(updated.getTitle());
            offer.setDescription(updated.getDescription());
            offer.setDepartment(updated.getDepartment());
            offer.setStatus(updated.getStatus());
            return ResponseEntity.ok(offerRepository.save(offer));
        }).orElse(ResponseEntity.notFound().build());
    }

    /* ====================== CV Applications ====================== */

    @GetMapping("/applications")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<List<CvApplication>> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAllByOrderBySubmittedAtDesc());
    }

    @GetMapping("/applications/stage/{stage}")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<List<CvApplication>> getByStage(@PathVariable KanbanStage stage) {
        return ResponseEntity.ok(applicationRepository.findByStage(stage));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('CV_UPLOAD')")
    @LogActivity(action = "UPLOAD", module = "CV", description = "Uploaded CV")
    public ResponseEntity<?> uploadCv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("candidateName") String candidateName,
            @RequestParam("candidateEmail") String candidateEmail,
            @RequestParam(value = "offerId", required = false) Long offerId) {
        try {
            String storedPath = fileStorageService.save(file);
            CvApplication.CvApplicationBuilder builder = CvApplication.builder()
                    .candidateName(candidateName)
                    .candidateEmail(candidateEmail)
                    .cvFileName(file.getOriginalFilename())
                    .cvFilePath(storedPath);
            if (offerId != null) {
                offerRepository.findById(offerId).ifPresent(builder::offer);
            }
            return ResponseEntity.ok(applicationRepository.save(builder.build()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    @PutMapping("/applications/{id}/stage")
    @PreAuthorize("hasAuthority('CV_SHORTLIST')")
    @LogActivity(action = "STAGE_CHANGE", module = "CV", description = "Changed CV kanban stage")
    public ResponseEntity<CvApplication> updateStage(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return applicationRepository.findById(id).map(app -> {
            app.setStage(KanbanStage.valueOf(body.get("stage")));
            app.setUpdatedAt(LocalDateTime.now());
            if (body.containsKey("notes")) app.setNotes(body.get("notes"));
            return ResponseEntity.ok(applicationRepository.save(app));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('CV_READ')")
    public ResponseEntity<?> searchCvs(@RequestParam("keyword") String keyword) {
        List<String> results = fileSearchService.searchKeyword(keyword);
        return results.isEmpty()
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).body("No CVs found")
                : ResponseEntity.ok(results);
    }
}
