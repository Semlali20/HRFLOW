package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.dto.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "permissions", ignore = true)
    UserResponse toResponse(User user);
}
