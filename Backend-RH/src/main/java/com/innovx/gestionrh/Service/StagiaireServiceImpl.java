package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.Stagiaires;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.StagiairesRepository;
import com.innovx.gestionrh.dto.DocumentValidityDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StagiaireServiceImpl implements StagiareService {
    @Autowired
    private StagiairesRepository stagiairesRepository;

    @Autowired
    private CollaborateursRepository collaborateursRepository;

    @Override
    public List<Stagiaires> getAllStagiaires() {
        List<Stagiaires> allStagiaires = stagiairesRepository.findAll();
        return allStagiaires.stream()
                .filter(stagiaire -> !stagiaire.isDeleted())
                .peek(this::checkAndUpdateStatus)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Stagiaires> getStagiairesById(Long id) {
        Optional<Stagiaires> stagiairesOpt = stagiairesRepository.findById(id);
        if (stagiairesOpt.isPresent() && !stagiairesOpt.get().isDeleted()) {
            checkAndUpdateStatus(stagiairesOpt.get());
            return stagiairesOpt;
        }
        return Optional.empty();
    }

    @Override
    public Stagiaires createStagiaires(Stagiaires stagiaires) {
        Collaborateurs existingCollaborateur = collaborateursRepository.findByFullName(stagiaires.getNomEncadrant());
        if (existingCollaborateur != null) {
            if ("Complete".equalsIgnoreCase(stagiaires.getStatus())) {
                stagiaires.createMeetings();
            }
            return stagiairesRepository.save(stagiaires);
        } else {
            throw new IllegalStateException("No collaborateur exists with the full name as provided.");
        }
    }

    @Override
    public Stagiaires updateStagiaires(Long id, Stagiaires updatedStagiaires) {
        updatedStagiaires.setMatricule(id);
        Stagiaires stagiaires = stagiairesRepository.findById(updatedStagiaires.getMatricule()).orElse(null);
        if (stagiaires != null) {
            BeanUtils.copyProperties(updatedStagiaires, stagiaires);
            if ("Complete".equalsIgnoreCase(stagiaires.getStatus())) {
                stagiaires.createMeetings();
            }
            checkAndUpdateStatus(stagiaires);
            return stagiairesRepository.save(stagiaires);
        }
        return updatedStagiaires;
    }

    @Override
    public String deleteStagiaires(Long id) {
        Stagiaires stagiaires = stagiairesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("stagiaires not found with ID: " + id));
        stagiairesRepository.delete(stagiaires);
        return "stagiaires deleted successfully.";
    }

    @Override
    public List<DocumentValidityDTO> getAllDocumentValidity() {
        return stagiairesRepository.findAll().stream().map(stagiaire -> {
            DocumentValidityDTO dto = new DocumentValidityDTO();
            dto.setMatricule(stagiaire.getMatricule());
            dto.setAttestationAssurance(stagiaire.isAttestationAssurance());
            dto.setCarteNationale(stagiaire.isCarteNationale());
            dto.setFicheAnthropométrique(stagiaire.isFicheAnthropométrique());
            dto.setCopieCertifiéeDiplômes(stagiaire.isCopieCertifiéeDiplômes());
            dto.setRelevéIdentitéBancaire(stagiaire.isRelevéIdentitéBancaire());
            dto.setCv(stagiaire.isCv());
            dto.setConventionStage(stagiaire.isConventionStage());
            dto.setFicheÉvaluation(stagiaire.isFicheÉvaluation());
            dto.setCharteEngagement(stagiaire.isCharteEngagement());
            dto.setAttestationStage(stagiaire.isAttestationStage());
            return dto;
        }).collect(Collectors.toList());
    }

    private void checkAndUpdateStatus(Stagiaires stagiaires) {
        LocalDate dateFinStage = convertToLocalDate(stagiaires.getDateFinStage());
        if ("Complete".equalsIgnoreCase(stagiaires.getStatus()) && LocalDate.now().isAfter(dateFinStage)) {
            stagiaires.setStatus("Terminé");
            stagiairesRepository.save(stagiaires);
        }
    }

    private LocalDate convertToLocalDate(Date date) {
        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }
}
