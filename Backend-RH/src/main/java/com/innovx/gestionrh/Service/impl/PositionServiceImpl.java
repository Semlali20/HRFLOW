package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Department;
import com.innovx.gestionrh.Entity.Position;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.DepartmentRepository;
import com.innovx.gestionrh.Repository.PositionRepository;
import com.innovx.gestionrh.Service.PositionService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.PositionRequest;
import com.innovx.gestionrh.dto.response.PositionResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.PositionMapper;
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
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;
    private final DepartmentRepository departmentRepository;
    private final CollaborateursRepository collaborateursRepository;
    private final PositionMapper positionMapper;

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "POSITION")
    public PositionResponse create(PositionRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        if (!department.isActive()) {
            throw new BusinessException("DEPARTMENT_INACTIVE",
                    "Cannot create a position under inactive department '" + department.getName() + "'.");
        }
        if (request.getCode() != null && positionRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Position with code '" + request.getCode() + "' already exists.");
        }
        if (positionRepository.existsByTitleAndDepartmentId(request.getTitle(), request.getDepartmentId())) {
            throw new ConflictException("A position titled '" + request.getTitle()
                    + "' already exists in department '" + department.getName() + "'.");
        }

        Position position = positionMapper.toEntity(request);
        position.setDepartment(department);
        return positionMapper.toResponse(positionRepository.save(position));
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "POSITION")
    public PositionResponse update(Long id, PositionRequest request) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        // Code uniqueness check (skip if same code)
        if (request.getCode() != null
                && !request.getCode().equalsIgnoreCase(position.getCode())
                && positionRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Position with code '" + request.getCode() + "' already exists.");
        }

        positionMapper.updateEntity(request, position);
        position.setDepartment(department);
        return positionMapper.toResponse(positionRepository.save(position));
    }

    @Override
    public PositionResponse findById(Long id) {
        return positionMapper.toResponse(
                positionRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id)));
    }

    @Override
    public Page<PositionResponse> findAll(Pageable pageable) {
        return positionRepository.findAll(pageable).map(positionMapper::toResponse);
    }

    @Override
    public List<PositionResponse> findByDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department", "id", departmentId);
        }
        return positionRepository.findByDepartmentIdAndActiveTrueOrderByTitleAsc(departmentId)
                .stream().map(positionMapper::toResponse).toList();
    }

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "POSITION")
    public void delete(Long id) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id));

        boolean hasEmployees = !collaborateursRepository.findByDepartmentId(position.getDepartment().getId())
                .stream()
                .filter(c -> c.getPosition() != null && c.getPosition().getId().equals(id))
                .toList()
                .isEmpty();

        if (hasEmployees) {
            throw new BusinessException("POSITION_HAS_EMPLOYEES",
                    "Cannot delete position '" + position.getTitle() + "': employees are currently assigned to it.");
        }
        positionRepository.delete(position);
    }
}
