package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.Stagiaires;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StagiairesRepository extends JpaRepository<Stagiaires, Long> {



}
