package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.PayslipStatus;
import com.innovx.gestionrh.dto.request.PayslipRequest;
import com.innovx.gestionrh.dto.response.PayslipResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PayslipService {
    PayslipResponse create(PayslipRequest request);
    PayslipResponse update(Long id, PayslipRequest request);
    PayslipResponse findById(Long id);
    Page<PayslipResponse> findAll(String period, PayslipStatus status, Pageable pageable);
    Page<PayslipResponse> findByCollaborateur(Long collaborateurId, Pageable pageable);
    PayslipResponse updateStatus(Long id, PayslipStatus status);
    void softDelete(Long id);
}
