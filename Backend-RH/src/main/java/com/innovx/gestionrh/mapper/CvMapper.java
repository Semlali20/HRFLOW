package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.CvApplication;
import com.innovx.gestionrh.dto.response.CvApplicationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface CvMapper {

    @Mapping(target = "offer", source = "offer")
    CvApplicationResponse toResponse(CvApplication application);
}
