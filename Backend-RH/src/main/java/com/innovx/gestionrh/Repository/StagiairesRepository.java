package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.InternStatus;
import com.innovx.gestionrh.Entity.Stagiaires;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StagiairesRepository
        extends JpaRepository<Stagiaires, Long>, JpaSpecificationExecutor<Stagiaires> {

    Optional<Stagiaires> findByCin(String cin);

    boolean existsByCin(String cin);

    List<Stagiaires> findByDepartmentId(Long departmentId);

    Page<Stagiaires> findByDepartmentId(Long departmentId, Pageable pageable);

    List<Stagiaires> findByStatus(InternStatus status);

    Page<Stagiaires> findByStatus(InternStatus status, Pageable pageable);

    @Query("SELECT s FROM Stagiaires s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.lastName)  LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.school)    LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Stagiaires> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT s FROM Stagiaires s WHERE s.endDate < :today AND s.status = 'ACTIVE'")
    List<Stagiaires> findExpiredActiveInterns(@Param("today") LocalDate today);
}
