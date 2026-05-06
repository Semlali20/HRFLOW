package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.Document;
import com.innovx.gestionrh.Entity.DocumentCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByEmployeeId(Long employeeId);

    Page<Document> findByEmployeeId(Long employeeId, Pageable pageable);

    List<Document> findByEmployeeIdAndCategory(Long employeeId, DocumentCategory category);

    /** Find documents expiring within a given date range — for expiry alerts. */
    @Query("SELECT d FROM Document d WHERE d.expiryDate BETWEEN :from AND :to AND d.isDeleted = false")
    List<Document> findExpiringSoon(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
