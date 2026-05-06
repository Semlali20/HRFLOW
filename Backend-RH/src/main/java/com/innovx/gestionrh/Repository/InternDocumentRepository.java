package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.InternDocument;
import com.innovx.gestionrh.Entity.InternDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternDocumentRepository extends JpaRepository<InternDocument, Long> {

    List<InternDocument> findByInternId(Long internId);

    Optional<InternDocument> findByInternIdAndDocumentType(Long internId, InternDocumentType type);

    boolean existsByInternIdAndDocumentType(Long internId, InternDocumentType type);

    long countByInternId(Long internId);

    long countByInternIdAndSubmittedTrue(Long internId);
}
