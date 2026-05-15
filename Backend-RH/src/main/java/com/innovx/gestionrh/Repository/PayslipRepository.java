package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.Payslip;
import com.innovx.gestionrh.Entity.PayslipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {

    Page<Payslip> findByCollaborateurId(Long collaborateurId, Pageable pageable);

    boolean existsByCollaborateurIdAndPeriod(Long collaborateurId, String period);

    @Query("SELECT p FROM Payslip p WHERE " +
           "(:period IS NULL OR p.period = :period) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Payslip> findAllFiltered(@Param("period") String period,
                                  @Param("status") PayslipStatus status,
                                  Pageable pageable);
}
