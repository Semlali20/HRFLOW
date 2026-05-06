package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CollaborateursRepository
        extends JpaRepository<Collaborateurs, Long>, JpaSpecificationExecutor<Collaborateurs> {

    Optional<Collaborateurs> findByEmail(String email);

    Optional<Collaborateurs> findByCin(String cin);

    Optional<Collaborateurs> findByEmployeeNumber(String employeeNumber);

    Optional<Collaborateurs> findByUserId(Long userId);

    boolean existsByEmail(String email);

    boolean existsByCin(String cin);

    boolean existsByEmployeeNumber(String employeeNumber);

    List<Collaborateurs> findByDepartmentId(Long departmentId);

    List<Collaborateurs> findByStatus(EmployeeStatus status);

    Page<Collaborateurs> findByDepartmentId(Long departmentId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Collaborateurs c WHERE c.department.id = :deptId")
    long countByDepartmentId(@Param("deptId") Long deptId);

    @Query("SELECT c FROM Collaborateurs c WHERE " +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.lastName)  LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.email)     LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.cin)       LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.employeeNumber) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Collaborateurs> search(@Param("q") String query, Pageable pageable);
}
