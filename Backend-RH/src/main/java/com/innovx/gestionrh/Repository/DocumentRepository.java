package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}
