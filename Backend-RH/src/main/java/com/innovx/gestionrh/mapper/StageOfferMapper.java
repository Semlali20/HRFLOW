package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.StageOffer;
import com.innovx.gestionrh.dto.request.StageOfferRequest;
import com.innovx.gestionrh.dto.response.StageOfferResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface StageOfferMapper {

    @Mapping(target = "department", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    StageOffer toEntity(StageOfferRequest request);

    @Mapping(target = "applicationCount", ignore = true)
    StageOfferResponse toResponse(StageOffer offer);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntity(StageOfferRequest request, @MappingTarget StageOffer offer);
}
