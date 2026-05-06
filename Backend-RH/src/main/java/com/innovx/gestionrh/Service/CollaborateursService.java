package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.EmployeeStatus;
import com.innovx.gestionrh.dto.request.CollaborateurRequest;
import com.innovx.gestionrh.dto.response.CollaborateurResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CollaborateursService {

    CollaborateurResponse create(CollaborateurRequest request);

    CollaborateurResponse update(Long id, CollaborateurRequest request);

    CollaborateurResponse findById(Long id);

    Page<CollaborateurResponse> findAll(Pageable pageable);

    Page<CollaborateurResponse> search(String query, Pageable pageable);

    Page<CollaborateurResponse> findByDepartment(Long departmentId, Pageable pageable);

    CollaborateurResponse updateStatus(Long id, EmployeeStatus status);

    /** Soft-delete: marks is_deleted = true and deactivates the linked user account. */
    void softDelete(Long id);

    /** Links an existing User account to this employee record. */
    CollaborateurResponse linkUser(Long collaborateurId, Long userId);

    /** Unlinks the User account from this employee record. */
    CollaborateurResponse unlinkUser(Long collaborateurId);
}
