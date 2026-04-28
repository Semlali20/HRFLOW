package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    List<LeaveType> findByActiveTrue();
    boolean existsByName(String name);
}
