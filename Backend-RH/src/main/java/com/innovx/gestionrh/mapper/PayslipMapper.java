package com.innovx.gestionrh.mapper;

import com.innovx.gestionrh.Entity.Payslip;
import com.innovx.gestionrh.dto.request.PayslipRequest;
import com.innovx.gestionrh.dto.response.PayslipResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PayslipMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "collaborateur", ignore = true)
    @Mapping(target = "netSalary", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    Payslip toEntity(PayslipRequest request);

    @Mapping(target = "collaborateurId", source = "collaborateur.id")
    @Mapping(target = "collaborateurNom", source = "collaborateur.lastName")
    @Mapping(target = "collaborateurPrenom", source = "collaborateur.firstName")
    PayslipResponse toResponse(Payslip payslip);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "collaborateur", ignore = true)
    @Mapping(target = "netSalary", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    void updateEntity(PayslipRequest request, @MappingTarget Payslip payslip);
}
