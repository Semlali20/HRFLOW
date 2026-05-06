package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.*;
import com.innovx.gestionrh.Repository.*;
import com.innovx.gestionrh.Service.CollaborateursService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.CollaborateurRequest;
import com.innovx.gestionrh.dto.response.CollaborateurResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.CollaborateurMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CollaborateursServiceImpl implements CollaborateursService {

    private final CollaborateursRepository collaborateursRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    private final CollaborateurMapper collaborateurMapper;

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "COLLABORATEUR")
    public CollaborateurResponse create(CollaborateurRequest request) {
        validateUniqueFields(null, request);

        Collaborateurs collaborateur = collaborateurMapper.toEntity(request);
        collaborateur.setEmployeeNumber(generateEmployeeNumber());
        resolveRelations(collaborateur, request);

        return collaborateurMapper.toResponse(collaborateursRepository.save(collaborateur));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "COLLABORATEUR")
    public CollaborateurResponse update(Long id, CollaborateurRequest request) {
        Collaborateurs collaborateur = findEntityById(id);
        validateUniqueFields(id, request);

        collaborateurMapper.updateEntity(request, collaborateur);
        resolveRelations(collaborateur, request);

        return collaborateurMapper.toResponse(collaborateursRepository.save(collaborateur));
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Override
    public CollaborateurResponse findById(Long id) {
        return collaborateurMapper.toResponse(findEntityById(id));
    }

    @Override
    public Page<CollaborateurResponse> findAll(Pageable pageable) {
        return collaborateursRepository.findAll(pageable)
                .map(collaborateurMapper::toResponse);
    }

    @Override
    public Page<CollaborateurResponse> search(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return findAll(pageable);
        }
        return collaborateursRepository.search(query.trim(), pageable)
                .map(collaborateurMapper::toResponse);
    }

    @Override
    public Page<CollaborateurResponse> findByDepartment(Long departmentId, Pageable pageable) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department", "id", departmentId);
        }
        return collaborateursRepository.findByDepartmentId(departmentId, pageable)
                .map(collaborateurMapper::toResponse);
    }

    // ── STATUS ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "UPDATE_STATUS", module = "COLLABORATEUR")
    public CollaborateurResponse updateStatus(Long id, EmployeeStatus status) {
        Collaborateurs collaborateur = findEntityById(id);

        if (collaborateur.getStatus() == status) {
            throw new BusinessException("SAME_STATUS",
                    "Employee already has status '" + status + "'.");
        }
        if (collaborateur.getStatus() == EmployeeStatus.TERMINATED
                && status == EmployeeStatus.ACTIVE) {
            throw new BusinessException("CANNOT_REACTIVATE_TERMINATED",
                    "A terminated employee cannot be directly reactivated. Create a new record if rehiring.");
        }

        collaborateur.setStatus(status);

        // Mirror status on the linked user account
        if (collaborateur.getUser() != null) {
            boolean shouldDisable =
                    (status == EmployeeStatus.TERMINATED || status == EmployeeStatus.INACTIVE);
            collaborateur.getUser().setDeleted(shouldDisable);
        }

        return collaborateurMapper.toResponse(collaborateursRepository.save(collaborateur));
    }

    // ── SOFT DELETE ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "COLLABORATEUR")
    public void softDelete(Long id) {
        Collaborateurs collaborateur = findEntityById(id);

        if (collaborateur.isDeleted()) {
            throw new BusinessException("ALREADY_DELETED",
                    "Employee record is already deactivated.");
        }

        collaborateur.setDeleted(true);
        collaborateur.setStatus(EmployeeStatus.TERMINATED);

        if (collaborateur.getUser() != null) {
            collaborateur.getUser().setDeleted(true);
            log.info("Linked user account id={} disabled alongside terminated employee id={}.",
                    collaborateur.getUser().getId(), id);
        }

        collaborateursRepository.save(collaborateur);
        log.info("Employee id={} soft-deleted.", id);
    }

    // ── USER LINKING ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "LINK_USER", module = "COLLABORATEUR")
    public CollaborateurResponse linkUser(Long collaborateurId, Long userId) {
        Collaborateurs collaborateur = findEntityById(collaborateurId);

        if (collaborateur.getUser() != null) {
            throw new ConflictException("Employee id=" + collaborateurId
                    + " is already linked to user id=" + collaborateur.getUser().getId()
                    + ". Unlink the current user first.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Prevent linking a user that belongs to another employee
        collaborateursRepository.findByUserId(userId).ifPresent(other -> {
            throw new ConflictException("User id=" + userId
                    + " is already linked to employee id=" + other.getId() + ".");
        });

        collaborateur.setUser(user);
        return collaborateurMapper.toResponse(collaborateursRepository.save(collaborateur));
    }

    @Override
    @Transactional
    @LogActivity(action = "UNLINK_USER", module = "COLLABORATEUR")
    public CollaborateurResponse unlinkUser(Long collaborateurId) {
        Collaborateurs collaborateur = findEntityById(collaborateurId);

        if (collaborateur.getUser() == null) {
            throw new BusinessException("NO_USER_LINKED",
                    "Employee id=" + collaborateurId + " has no linked user account to remove.");
        }

        collaborateur.setUser(null);
        return collaborateurMapper.toResponse(collaborateursRepository.save(collaborateur));
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private Collaborateurs findEntityById(Long id) {
        return collaborateursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    private void validateUniqueFields(Long currentId, CollaborateurRequest request) {
        collaborateursRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ConflictException(
                        "An employee with email '" + request.getEmail() + "' already exists.");
            }
        });

        if (request.getCin() != null && !request.getCin().isBlank()) {
            collaborateursRepository.findByCin(request.getCin()).ifPresent(existing -> {
                if (currentId == null || !existing.getId().equals(currentId)) {
                    throw new ConflictException(
                            "An employee with CIN '" + request.getCin() + "' already exists.");
                }
            });
        }
    }

    private void resolveRelations(Collaborateurs collaborateur, CollaborateurRequest request) {
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department", "id", request.getDepartmentId()));
            if (!dept.isActive()) {
                throw new BusinessException("DEPARTMENT_INACTIVE",
                        "Cannot assign employee to inactive department '" + dept.getName() + "'.");
            }
            collaborateur.setDepartment(dept);
        } else {
            collaborateur.setDepartment(null);
        }

        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Position", "id", request.getPositionId()));

            if (request.getDepartmentId() != null
                    && position.getDepartment() != null
                    && !position.getDepartment().getId().equals(request.getDepartmentId())) {
                throw new BusinessException("POSITION_DEPT_MISMATCH",
                        "Position '" + position.getTitle()
                        + "' does not belong to the selected department.");
            }
            if (!position.isActive()) {
                throw new BusinessException("POSITION_INACTIVE",
                        "Position '" + position.getTitle() + "' is no longer active.");
            }
            collaborateur.setPosition(position);
        } else {
            collaborateur.setPosition(null);
        }
    }

    /** Generates a sequential employee number: EMP-00001, EMP-00002, … */
    private String generateEmployeeNumber() {
        long next = collaborateursRepository.count() + 1;
        String candidate = "EMP-" + String.format("%05d", next);
        int guard = 0;
        while (collaborateursRepository.existsByEmployeeNumber(candidate)) {
            guard++;
            if (guard > 200) {
                throw new BusinessException("EMP_NUMBER_EXHAUSTED",
                        "Unable to generate a unique employee number after 200 attempts.");
            }
            candidate = "EMP-" + String.format("%05d", next + guard);
        }
        return candidate;
    }
}
