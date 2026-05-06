package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.PublicHoliday;
import com.innovx.gestionrh.dto.request.PublicHolidayRequest;
import com.innovx.gestionrh.dto.response.PublicHolidayResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PublicHolidayMapper {

    @Mapping(target = "id", ignore = true)
    PublicHoliday toEntity(PublicHolidayRequest request);

    PublicHolidayResponse toResponse(PublicHoliday holiday);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateEntity(PublicHolidayRequest request, @MappingTarget PublicHoliday holiday);
}
