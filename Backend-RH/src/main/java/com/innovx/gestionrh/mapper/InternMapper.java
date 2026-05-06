package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.Stagiaires;
import com.innovx.gestionrh.dto.request.InternRequest;
import com.innovx.gestionrh.dto.response.InternResponse;
import org.mapstruct.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface InternMapper {

    @Mapping(target = "department", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    Stagiaires toEntity(InternRequest request);

    @Mapping(target = "durationMonths", ignore = true)
    @Mapping(target = "totalDocuments", ignore = true)
    @Mapping(target = "submittedDocuments", ignore = true)
    InternResponse toResponse(Stagiaires intern);

    @AfterMapping
    default void setComputedFields(Stagiaires source, @MappingTarget InternResponse target) {
        if (source.getStartDate() != null && source.getEndDate() != null) {
            long months = ChronoUnit.MONTHS.between(source.getStartDate(), source.getEndDate());
            target.setDurationMonths((int) months);
        }
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    void updateEntity(InternRequest request, @MappingTarget Stagiaires intern);
}
