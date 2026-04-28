package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CollaborateursServiceImpl implements CollaborateursService {

    @Autowired
    private CollaborateursRepository collaborateursRepository;

    @Override
    public List<Collaborateurs> getAllCollaborateurs() {
        try {
            return collaborateursRepository.findAll().stream()
                    .filter(c -> !c.isDeleted())
                    .map(this::formatCollaborateurDates)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch all collaborateurs: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch collaborateurs", e);
        }
    }

    @Override
    public Optional<Collaborateurs> getCollaborateursById(Long id) {
        try {
            return collaborateursRepository.findById(id)
                    .map(this::formatCollaborateurDates);
        } catch (Exception e) {
            log.error("Failed to fetch collaborateur id={}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch collaborateur", e);
        }
    }

    @Override
    public List<String> getAllCollaborateursDateNaissance() {
        try {
            return collaborateursRepository.findAll().stream()
                    .filter(c -> !c.isDeleted())
                    .map(Collaborateurs::getDate_naissance)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch birthdays: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch birth dates", e);
        }
    }

    @Override
    public Collaborateurs createCollaborateurs(Collaborateurs collaborateur) {
        try {
            return collaborateursRepository.save(collaborateur);
        } catch (Exception e) {
            log.error("Failed to create collaborateur: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create collaborateur", e);
        }
    }

    @Override
    public Collaborateurs updateCollaborateurs(Long id, Collaborateurs updatedCollaborateur) {
        try {
            Collaborateurs existing = collaborateursRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Collaborateur", "id", id));
            updatedCollaborateur.setMatricule(id);
            BeanUtils.copyProperties(updatedCollaborateur, existing);
            return collaborateursRepository.save(existing);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to update collaborateur id={}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to update collaborateur", e);
        }
    }

    @Override
    public String deleteCollaborateurs(Long id) {
        try {
            Collaborateurs collaborateur = collaborateursRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Collaborateur", "id", id));
            collaborateursRepository.delete(collaborateur);
            log.info("Collaborateur id={} deleted", id);
            return "Collaborateur deleted successfully.";
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to delete collaborateur id={}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete collaborateur", e);
        }
    }

    @Override
    public List<String> getAllBirthdays() {
        try {
            return collaborateursRepository.findAll().stream()
                    .map(Collaborateurs::getDate_naissance)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch all birthdays: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch birthdays", e);
        }
    }

    private Collaborateurs formatCollaborateurDates(Collaborateurs collaborateur) {
        try {
            if (collaborateur.getDate_entree() != null) {
                collaborateur.setDate_entree(formatDate(collaborateur.getDate_entree()));
            }
            if (collaborateur.getDate_naissance() != null) {
                collaborateur.setDate_naissance(formatDate(collaborateur.getDate_naissance()));
            }
        } catch (DateTimeParseException e) {
            log.warn("Could not parse date for collaborateur id={}: {}", collaborateur.getMatricule(), e.getMessage());
        }
        return collaborateur;
    }

    private String formatDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return dateStr;

        DateTimeFormatter[] formatters = new DateTimeFormatter[]{
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.FRENCH)
        };

        for (DateTimeFormatter formatter : formatters) {
            try {
                LocalDateTime dateTime = LocalDateTime.parse(dateStr, formatter);
                return dateTime.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            } catch (DateTimeParseException ignored) {}

            try {
                LocalDate date = LocalDate.parse(dateStr, formatter);
                return date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            } catch (DateTimeParseException ignored) {}
        }

        return dateStr;
    }
}
