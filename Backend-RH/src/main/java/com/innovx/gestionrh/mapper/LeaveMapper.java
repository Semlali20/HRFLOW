package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.LeaveBalance;
import com.innovx.gestionrh.Entity.LeaveRequest;
import com.innovx.gestionrh.Entity.LeaveType;
import com.innovx.gestionrh.dto.request.LeaveRequestDto;
import com.innovx.gestionrh.dto.request.LeaveTypeRequest;
import com.innovx.gestionrh.dto.response.LeaveBalanceResponse;
import com.innovx.gestionrh.dto.response.LeaveRequestResponse;
import com.innovx.gestionrh.dto.response.LeaveTypeResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ReferenceMapper.class})
public interface LeaveMapper {

    // ── LeaveType ──────────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    LeaveType toEntity(LeaveTypeRequest request);

    LeaveTypeResponse toTypeResponse(LeaveType leaveType);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateEntity(LeaveTypeRequest request, @MappingTarget LeaveType leaveType);

    // ── LeaveRequest ──────────────────────────────────────────────────────────

    @Mapping(target = "requester", ignore = true)
    @Mapping(target = "leaveType", ignore = true)
    @Mapping(target = "durationDays", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "approver", ignore = true)
    @Mapping(target = "approverComment", ignore = true)
    @Mapping(target = "decidedAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    LeaveRequest toEntity(LeaveRequestDto dto);

    LeaveRequestResponse toRequestResponse(LeaveRequest leaveRequest);

    // ── LeaveBalance ──────────────────────────────────────────────────────────

    @Mapping(target = "remainingDays", source = "remainingDays")
    LeaveBalanceResponse toBalanceResponse(LeaveBalance leaveBalance);
}
