package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.InternDocument;
import com.innovx.gestionrh.dto.request.InternDocumentRequest;
import com.innovx.gestionrh.dto.response.InternDocumentResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface InternDocumentMapper {

    @Mapping(target = "intern", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    InternDocument toEntity(InternDocumentRequest request);

    InternDocumentResponse toResponse(InternDocument internDocument);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "intern", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntity(InternDocumentRequest request, @MappingTarget InternDocument internDocument);
}
