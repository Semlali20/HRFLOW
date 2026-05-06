package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.Department;
import com.innovx.gestionrh.dto.request.DepartmentRequest;
import com.innovx.gestionrh.dto.response.DepartmentResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface DepartmentMapper {

    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    Department toEntity(DepartmentRequest request);

    @Mapping(target = "employeeCount", ignore = true)
    DepartmentResponse toResponse(Department department);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntity(DepartmentRequest request, @MappingTarget Department department);
}
