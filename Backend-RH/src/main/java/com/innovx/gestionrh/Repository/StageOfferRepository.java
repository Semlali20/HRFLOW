package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.StageOffer;
import com.innovx.gestionrh.Entity.StageOffer.OfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StageOfferRepository extends JpaRepository<StageOffer, Long> {

    // JOIN FETCH department so the lazy proxy is always initialized before the transaction ends
    @Query(value = "SELECT o FROM StageOffer o LEFT JOIN FETCH o.department",
           countQuery = "SELECT count(o) FROM StageOffer o")
    Page<StageOffer> findAllWithDepartment(Pageable pageable);

    @Query(value = "SELECT o FROM StageOffer o LEFT JOIN FETCH o.department WHERE o.status = :status",
           countQuery = "SELECT count(o) FROM StageOffer o WHERE o.status = :status")
    Page<StageOffer> findByStatusWithDepartment(@Param("status") OfferStatus status, Pageable pageable);

    Page<StageOffer> findByDepartmentId(Long departmentId, Pageable pageable);

    @Query(value = "SELECT o FROM StageOffer o LEFT JOIN FETCH o.department WHERE " +
           "LOWER(o.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :q, '%'))",
           countQuery = "SELECT count(o) FROM StageOffer o WHERE " +
           "LOWER(o.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<StageOffer> search(@Param("q") String query, Pageable pageable);
}
