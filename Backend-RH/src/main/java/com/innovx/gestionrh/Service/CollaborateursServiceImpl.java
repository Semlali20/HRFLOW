package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
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
public class CollaborateursServiceImpl implements CollaborateursService {
    @Autowired
    private CollaborateursRepository collaborateursRepository;

    @Override
    public List<Collaborateurs> getAllCollaborateurs() {
        List<Collaborateurs> allCollaborateurs = collaborateursRepository.findAll();
        return allCollaborateurs.stream()
                .filter(collaborateurs -> !collaborateurs.isDeleted())
                .map(this::formatCollaborateurDates)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Collaborateurs> getCollaborateursById(Long id) {
        Optional<Collaborateurs> collaborateursOpt = collaborateursRepository.findById(id);
        return collaborateursOpt.map(this::formatCollaborateurDates);
    }

    @Override
    public List<String> getAllCollaborateursDateNaissance() {
        return collaborateursRepository.findAll().stream()
                .filter(collaborateurs -> !collaborateurs.isDeleted())
                .map(Collaborateurs::getDate_naissance) // This method reference should return a String
                .collect(Collectors.toList());
    }

    @Override
    public Collaborateurs createCollaborateurs(Collaborateurs collaborateur) {
        return collaborateursRepository.save(collaborateur);
    }

    @Override
    public Collaborateurs updateCollaborateurs(Long id, Collaborateurs updatedCollaborateur) {
        updatedCollaborateur.setMatricule(id);
        Collaborateurs existingCollaborateur = collaborateursRepository.findById(id).orElse(null);
        if (existingCollaborateur != null) {
            BeanUtils.copyProperties(updatedCollaborateur, existingCollaborateur);
            return collaborateursRepository.save(existingCollaborateur);
        }
        return null;
    }

    @Override
    public String deleteCollaborateurs(Long id) {
        Collaborateurs collaborateur = collaborateursRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collaborateur not found with ID: " + id));
        collaborateursRepository.delete(collaborateur);
        return "Collaborateur deleted successfully.";
    }

    @Override
    public List<String> getAllBirthdays() {
        return collaborateursRepository.findAll().stream()
                .map(Collaborateurs::getDate_naissance)
                .collect(Collectors.toList());
    }

    private Collaborateurs formatCollaborateurDates(Collaborateurs collaborateur) {
        // Format date_entree
        String formattedDateEntree = formatDate(collaborateur.getDate_entree());
        collaborateur.setDate_entree(formattedDateEntree);

        // Format date_naissance
        String formattedDateNaissance = formatDate(collaborateur.getDate_naissance());
        collaborateur.setDate_naissance(formattedDateNaissance);

        return collaborateur;
    }

    private String formatDate(String dateStr) {
        DateTimeFormatter[] formatters = new DateTimeFormatter[]{
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.FRENCH)
        };

        for (DateTimeFormatter formatter : formatters) {
            try {
                // Try parsing as LocalDateTime
                LocalDateTime dateTime = LocalDateTime.parse(dateStr, formatter);
                return dateTime.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            } catch (DateTimeParseException e) {
                // Ignore and try next formatter
            }

            try {
                // Try parsing as LocalDate
                LocalDate date = LocalDate.parse(dateStr, formatter);
                return date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            } catch (DateTimeParseException e) {
                // Ignore and try next formatter
            }
        }

        // If all parsing attempts fail, return the original string or handle the error
        throw new DateTimeParseException("Unparseable date: " + dateStr, dateStr, 0);
    }

}
