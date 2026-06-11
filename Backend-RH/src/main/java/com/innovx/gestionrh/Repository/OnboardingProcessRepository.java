package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.OnboardingProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OnboardingProcessRepository extends JpaRepository<OnboardingProcess, Long> {
    List<OnboardingProcess> findByCollaborateurId(Long collaborateurId);
    Optional<OnboardingProcess> findTopByCollaborateurIdAndTypeOrderByStartDateDesc(Long collabId, String type);
}
