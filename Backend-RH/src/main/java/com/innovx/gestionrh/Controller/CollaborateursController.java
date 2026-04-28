package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Service.CollaborateursService;
import com.innovx.gestionrh.Service.ExcelService;
import com.innovx.gestionrh.annotation.LogActivity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1")
public class CollaborateursController {

    private final CollaborateursService collaborateurservice;
    private final ExcelService excelService;
    private final CollaborateursRepository collaborateursRepository;

    @GetMapping("/Collaborateurs")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public List<Collaborateurs> allCollaborateurs() {
        return collaborateurservice.getAllCollaborateurs();
    }

    @GetMapping("/Collaborateurs/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public Optional<Collaborateurs> getCollaborateurById(@PathVariable Long id) {
        return collaborateurservice.getCollaborateursById(id);
    }

    @PostMapping("/Collaborateurs")
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    @LogActivity(action = "CREATE", module = "EMPLOYEE", description = "Created employee")
    public Collaborateurs createCollaborateur(@RequestBody Collaborateurs collaborateur) {
        return collaborateurservice.createCollaborateurs(collaborateur);
    }

    @PutMapping("/Collaborateurs/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    @LogActivity(action = "UPDATE", module = "EMPLOYEE", description = "Updated employee")
    public Collaborateurs updateCollaborateur(@PathVariable Long id, @RequestBody Collaborateurs updated) {
        return collaborateurservice.updateCollaborateurs(id, updated);
    }

    @DeleteMapping("/Collaborateurs/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_DELETE')")
    @LogActivity(action = "DELETE", module = "EMPLOYEE", description = "Soft-deleted employee")
    public ResponseEntity<Object> deleteCollaborateur(@PathVariable Long id) {
        Optional<Collaborateurs> existing = collaborateurservice.getCollaborateursById(id);
        if (existing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaborateur not found");
        }
        Collaborateurs c = existing.get();
        c.setDeleted(true);
        collaborateursRepository.save(c);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/Collaborateurs/all-birthdays")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public List<String> getAllCollaborateursDateNaissance() {
        return collaborateurservice.getAllCollaborateursDateNaissance();
    }

    @PostMapping("/Collaborateurs/import")
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    @LogActivity(action = "IMPORT", module = "EMPLOYEE", description = "Imported employees from Excel")
    public ResponseEntity<String> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            excelService.importDataFromExcel(file.getInputStream());
            return ResponseEntity.ok("Data imported successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to import data.");
        }
    }
}
