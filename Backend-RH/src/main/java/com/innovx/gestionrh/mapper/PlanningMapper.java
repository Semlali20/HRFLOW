package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.PlanningEvent;
import com.innovx.gestionrh.dto.request.PlanningEventRequest;
import com.innovx.gestionrh.dto.response.PlanningEventResponse;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface PlanningMapper {

    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "attendees", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    PlanningEvent toEntity(PlanningEventRequest request);

    @Mapping(target = "attendees", source = "attendees")
    PlanningEventResponse toResponse(PlanningEvent event);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "attendees", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntity(PlanningEventRequest request, @MappingTarget PlanningEvent event);
}
