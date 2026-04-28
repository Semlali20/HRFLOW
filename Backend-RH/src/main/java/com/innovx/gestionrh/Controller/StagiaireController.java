package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.Stagiaires;
import com.innovx.gestionrh.Repository.StagiairesRepository;
import com.innovx.gestionrh.Service.StagiareService;
import com.innovx.gestionrh.annotation.LogActivity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1")
public class StagiaireController {

    private final StagiareService stagiaireService;
    private final StagiairesRepository stagiairesRepository;

    @GetMapping("/stagiares")
    @PreAuthorize("hasAuthority('STAGIAIRE_READ')")
    public List<Stagiaires> allStagiaires() {
        return stagiaireService.getAllStagiaires();
    }

    @GetMapping("/stagiares/{id}")
    @PreAuthorize("hasAuthority('STAGIAIRE_READ')")
    public Optional<Stagiaires> getStagiaireById(@PathVariable Long id) {
        return stagiaireService.getStagiairesById(id);
    }

    @PostMapping("/stagiares")
    @PreAuthorize("hasAuthority('STAGIAIRE_CREATE')")
    @LogActivity(action = "CREATE", module = "STAGIAIRE", description = "Created intern")
    public Stagiaires createStagiaire(@RequestBody Stagiaires stagiaire) {
        return stagiaireService.createStagiaires(stagiaire);
    }

    @PutMapping("/stagiares/{id}")
    @PreAuthorize("hasAuthority('STAGIAIRE_UPDATE')")
    @LogActivity(action = "UPDATE", module = "STAGIAIRE", description = "Updated intern")
    public Stagiaires updateStagiaire(@PathVariable Long id, @RequestBody Stagiaires updated) {
        return stagiaireService.updateStagiaires(id, updated);
    }

    @DeleteMapping("/stagiares/{id}")
    @PreAuthorize("hasAuthority('STAGIAIRE_DELETE')")
    @LogActivity(action = "DELETE", module = "STAGIAIRE", description = "Soft-deleted intern")
    public ResponseEntity<Object> deleteStagiaire(@PathVariable Long id) {
        Optional<Stagiaires> existing = stagiaireService.getStagiairesById(id);
        if (existing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Stagiaire not found");
        }
        Stagiaires s = existing.get();
        s.setDeleted(true);
        stagiairesRepository.save(s);
        return ResponseEntity.ok().build();
    }
}
