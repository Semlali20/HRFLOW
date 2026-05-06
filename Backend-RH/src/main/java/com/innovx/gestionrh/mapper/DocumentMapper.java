package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.Document;
import com.innovx.gestionrh.dto.response.DocumentResponse;
import org.mapstruct.*;

import java.time.LocalDate;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface DocumentMapper {

    @Mapping(target = "expired", ignore = true)
    DocumentResponse toResponse(Document document);

    @AfterMapping
    default void setExpired(Document source, @MappingTarget DocumentResponse target) {
        if (source.getExpiryDate() != null) {
            target.setExpired(source.getExpiryDate().isBefore(LocalDate.now()));
        }
    }
}
