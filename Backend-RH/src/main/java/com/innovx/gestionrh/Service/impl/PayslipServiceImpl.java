package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Payslip;
import com.innovx.gestionrh.Entity.PayslipStatus;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.PayslipRepository;
import com.innovx.gestionrh.Service.PayslipService;
import com.innovx.gestionrh.dto.request.PayslipRequest;
import com.innovx.gestionrh.dto.response.PayslipResponse;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.PayslipMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PayslipServiceImpl implements PayslipService {

    private final PayslipRepository payslipRepository;
    private final CollaborateursRepository collaborateursRepository;
    private final PayslipMapper payslipMapper;

    @Override
    @Transactional
    public PayslipResponse create(PayslipRequest request) {
        var collaborateur = collaborateursRepository.findById(request.getCollaborateurId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getCollaborateurId()));

        if (payslipRepository.existsByCollaborateurIdAndPeriod(request.getCollaborateurId(), request.getPeriod())) {
            throw new ConflictException("A payslip already exists for this employee and period: " + request.getPeriod());
        }

        Payslip payslip = payslipMapper.toEntity(request);
        payslip.setCollaborateur(collaborateur);
        payslip.setNetSalary(calcNet(request.getBaseSalary(), request.getBonuses(), request.getDeductions()));
        payslip.setStatus(PayslipStatus.DRAFT);
        payslip.setIsDeleted(false);

        return payslipMapper.toResponse(payslipRepository.save(payslip));
    }

    @Override
    @Transactional
    public PayslipResponse update(Long id, PayslipRequest request) {
        Payslip payslip = getOrThrow(id);
        payslipMapper.updateEntity(request, payslip);
        payslip.setNetSalary(calcNet(payslip.getBaseSalary(), payslip.getBonuses(), payslip.getDeductions()));
        return payslipMapper.toResponse(payslipRepository.save(payslip));
    }

    @Override
    public PayslipResponse findById(Long id) {
        return payslipMapper.toResponse(getOrThrow(id));
    }

    @Override
    public Page<PayslipResponse> findAll(String period, PayslipStatus status, Pageable pageable) {
        return payslipRepository.findAllFiltered(period, status, pageable)
                .map(payslipMapper::toResponse);
    }

    @Override
    public Page<PayslipResponse> findByCollaborateur(Long collaborateurId, Pageable pageable) {
        return payslipRepository.findByCollaborateurId(collaborateurId, pageable)
                .map(payslipMapper::toResponse);
    }

    @Override
    @Transactional
    public PayslipResponse updateStatus(Long id, PayslipStatus status) {
        Payslip payslip = getOrThrow(id);
        payslip.setStatus(status);
        return payslipMapper.toResponse(payslipRepository.save(payslip));
    }

    @Override
    @Transactional
    public void softDelete(Long id) {
        Payslip payslip = getOrThrow(id);
        payslip.setIsDeleted(true);
        payslipRepository.save(payslip);
    }

    private Payslip getOrThrow(Long id) {
        return payslipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip", "id", id));
    }

    private BigDecimal calcNet(BigDecimal base, BigDecimal bonuses, BigDecimal deductions) {
        BigDecimal b = bonuses != null ? bonuses : BigDecimal.ZERO;
        BigDecimal d = deductions != null ? deductions : BigDecimal.ZERO;
        return base.add(b).subtract(d);
    }
}
