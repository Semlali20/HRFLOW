package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.AuditLog;
import com.innovx.gestionrh.dto.response.AuditLogResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    AuditLogResponse toResponse(AuditLog auditLog);
}
