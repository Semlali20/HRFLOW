package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.Stagiaires;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public interface CollaborateursRepository extends JpaRepository<Collaborateurs, Long> {
    @Query("SELECT c FROM Collaborateurs c WHERE CONCAT(c.nom, ' ', c.prenom) = ?1")
    Collaborateurs findByFullName(String fullName);
    List<Collaborateurs> findAllByOrderByMatriculeAsc();

}

