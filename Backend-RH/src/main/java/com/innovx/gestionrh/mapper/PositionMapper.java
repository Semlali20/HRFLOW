package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.Position;
import com.innovx.gestionrh.dto.request.PositionRequest;
import com.innovx.gestionrh.dto.response.PositionResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface PositionMapper {

    @Mapping(target = "department", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    Position toEntity(PositionRequest request);

    PositionResponse toResponse(Position position);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntity(PositionRequest request, @MappingTarget Position position);
}
