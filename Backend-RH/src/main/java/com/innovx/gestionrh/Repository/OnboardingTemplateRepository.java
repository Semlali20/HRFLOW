package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.OnboardingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OnboardingTemplateRepository extends JpaRepository<OnboardingTemplate, Long> {
    List<OnboardingTemplate> findByType(String type);
}
