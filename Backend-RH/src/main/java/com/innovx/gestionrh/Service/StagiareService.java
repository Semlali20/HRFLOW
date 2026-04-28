package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Document;
import com.innovx.gestionrh.Entity.Stagiaires;
import com.innovx.gestionrh.dto.DocumentValidityDTO;

import java.util.List;
import java.util.Optional;

public interface StagiareService {
    List<Stagiaires> getAllStagiaires();

    Optional<Stagiaires> getStagiairesById(Long id);

        Stagiaires createStagiaires(Stagiaires stagiaires) ;

    Stagiaires updateStagiaires(Long id, Stagiaires updatedStagiaires);
    List<DocumentValidityDTO> getAllDocumentValidity();
    String deleteStagiaires(Long id);

}
