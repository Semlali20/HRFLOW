package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.PositionRequest;
import com.innovx.gestionrh.dto.response.PositionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PositionService {

    PositionResponse create(PositionRequest request);

    PositionResponse update(Long id, PositionRequest request);

    PositionResponse findById(Long id);

    Page<PositionResponse> findAll(Pageable pageable);

    List<PositionResponse> findByDepartment(Long departmentId);

    void delete(Long id);
}
