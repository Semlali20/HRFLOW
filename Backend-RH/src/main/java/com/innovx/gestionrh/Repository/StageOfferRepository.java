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

    Page<StageOffer> findByStatus(OfferStatus status, Pageable pageable);

    Page<StageOffer> findByDepartmentId(Long departmentId, Pageable pageable);

    @Query("SELECT o FROM StageOffer o WHERE " +
           "LOWER(o.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<StageOffer> search(@Param("q") String query, Pageable pageable);
}
