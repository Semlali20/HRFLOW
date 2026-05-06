package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    List<Position> findByDepartmentId(Long departmentId);

    List<Position> findByDepartmentIdAndActiveTrueOrderByTitleAsc(Long departmentId);

    Optional<Position> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByTitleAndDepartmentId(String title, Long departmentId);
}
