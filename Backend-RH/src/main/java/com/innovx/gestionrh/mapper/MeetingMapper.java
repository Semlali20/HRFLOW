package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.Meeting;
import com.innovx.gestionrh.dto.request.MeetingRequest;
import com.innovx.gestionrh.dto.response.MeetingResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface MeetingMapper {

    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "participants", ignore = true)
    @Mapping(target = "intern", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    Meeting toEntity(MeetingRequest request);

    @Mapping(target = "organizer", source = "organizer")
    @Mapping(target = "participants", source = "participants")
    @Mapping(target = "intern", source = "intern")
    MeetingResponse toResponse(Meeting meeting);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "participants", ignore = true)
    @Mapping(target = "intern", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntity(MeetingRequest request, @MappingTarget Meeting meeting);
}
