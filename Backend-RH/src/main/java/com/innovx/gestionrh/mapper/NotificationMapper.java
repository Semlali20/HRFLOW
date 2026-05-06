package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.Notification;
import com.innovx.gestionrh.dto.response.NotificationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "read", source = "read")
    @Mapping(target = "createdAt", source = "createdAt")
    NotificationResponse toResponse(Notification notification);
}
