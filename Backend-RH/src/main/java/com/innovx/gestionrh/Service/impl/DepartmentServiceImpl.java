package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Department;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.DepartmentRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.DepartmentService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.DepartmentRequest;
import com.innovx.gestionrh.dto.response.DepartmentResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.DepartmentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CollaborateursRepository collaborateursRepository;
    private final UserRepository userRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "DEPARTMENT")
    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Department with code '" + request.getCode() + "' already exists.");
        }
        if (departmentRepository.existsByName(request.getName())) {
            throw new ConflictException("Department with name '" + request.getName() + "' already exists.");
        }

        Department department = departmentMapper.toEntity(request);

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getManagerId()));
            department.setManager(manager);
        }

        Department saved = departmentRepository.save(department);
        DepartmentResponse response = departmentMapper.toResponse(saved);
        response.setEmployeeCount(collaborateursRepository.countByDepartmentId(saved.getId()));
        return response;
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "DEPARTMENT")
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        // Code uniqueness — allow keeping the same code
        if (!department.getCode().equalsIgnoreCase(request.getCode())
                && departmentRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Department with code '" + request.getCode() + "' already exists.");
        }
        // Name uniqueness
        if (!department.getName().equalsIgnoreCase(request.getName())
                && departmentRepository.existsByName(request.getName())) {
            throw new ConflictException("Department with name '" + request.getName() + "' already exists.");
        }

        departmentMapper.updateEntity(request, department);

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getManagerId()));
            department.setManager(manager);
        } else {
            department.setManager(null);
        }

        Department saved = departmentRepository.save(department);
        DepartmentResponse response = departmentMapper.toResponse(saved);
        response.setEmployeeCount(collaborateursRepository.countByDepartmentId(saved.getId()));
        return response;
    }

    @Override
    public DepartmentResponse findById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        DepartmentResponse response = departmentMapper.toResponse(department);
        response.setEmployeeCount(collaborateursRepository.countByDepartmentId(id));
        return response;
    }

    @Override
    public Page<DepartmentResponse> findAll(Pageable pageable) {
        return departmentRepository.findAll(pageable).map(dept -> {
            DepartmentResponse response = departmentMapper.toResponse(dept);
            response.setEmployeeCount(collaborateursRepository.countByDepartmentId(dept.getId()));
            return response;
        });
    }

    @Override
    public List<DepartmentResponse> findAllActive() {
        return departmentRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(dept -> {
                    DepartmentResponse response = departmentMapper.toResponse(dept);
                    response.setEmployeeCount(collaborateursRepository.countByDepartmentId(dept.getId()));
                    return response;
                })
                .toList();
    }

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "DEPARTMENT")
    public void delete(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        long employeeCount = collaborateursRepository.countByDepartmentId(id);
        if (employeeCount > 0) {
            throw new BusinessException("DEPARTMENT_HAS_EMPLOYEES",
                    "Cannot delete department '" + department.getName() + "': it still has "
                    + employeeCount + " active employee(s). Reassign them first.");
        }

        departmentRepository.delete(department);
        log.info("Department '{}' (id={}) deleted.", department.getName(), id);
    }
}
