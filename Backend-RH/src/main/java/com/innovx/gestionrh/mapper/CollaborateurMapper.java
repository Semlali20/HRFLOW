package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.dto.request.CollaborateurRequest;
import com.innovx.gestionrh.dto.response.CollaborateurResponse;
import org.mapstruct.*;

import java.time.LocalDate;
import java.time.Period;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface CollaborateurMapper {

    @Mapping(target = "department", ignore = true)
    @Mapping(target = "position", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "employeeNumber", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    Collaborateurs toEntity(CollaborateurRequest request);

    @Mapping(target = "age", ignore = true)
    @Mapping(target = "seniorityYears", ignore = true)
    @Mapping(target = "seniorityMonths", ignore = true)
    @Mapping(target = "linkedUserId", ignore = true)
    CollaborateurResponse toResponse(Collaborateurs collaborateur);

    @AfterMapping
    default void setComputedFields(Collaborateurs source, @MappingTarget CollaborateurResponse target) {
        LocalDate today = LocalDate.now();
        if (source.getDateOfBirth() != null) {
            target.setAge(Period.between(source.getDateOfBirth(), today).getYears());
        }
        if (source.getHireDate() != null) {
            Period seniority = Period.between(source.getHireDate(), today);
            target.setSeniorityYears(seniority.getYears());
            target.setSeniorityMonths(seniority.getMonths());
        }
        if (source.getUser() != null) {
            target.setLinkedUserId(source.getUser().getId());
        }
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "position", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "employeeNumber", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    void updateEntity(CollaborateurRequest request, @MappingTarget Collaborateurs collaborateur);
}
