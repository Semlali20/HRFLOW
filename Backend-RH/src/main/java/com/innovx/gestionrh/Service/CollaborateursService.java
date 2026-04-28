package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Collaborateurs;

import java.util.List;
import java.util.Optional;

public interface CollaborateursService {
    List<Collaborateurs> getAllCollaborateurs();

    Optional<Collaborateurs> getCollaborateursById(Long id);
    List<String> getAllCollaborateursDateNaissance() ;
    Collaborateurs createCollaborateurs(Collaborateurs Collaborateurs);

    Collaborateurs updateCollaborateurs(Long id, Collaborateurs updatedCollaborateurs);

    String deleteCollaborateurs(Long id);
    List<String> getAllBirthdays();

}
