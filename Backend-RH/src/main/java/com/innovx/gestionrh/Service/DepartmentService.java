package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.DepartmentRequest;
import com.innovx.gestionrh.dto.response.DepartmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DepartmentService {

    DepartmentResponse create(DepartmentRequest request);

    DepartmentResponse update(Long id, DepartmentRequest request);

    DepartmentResponse findById(Long id);

    Page<DepartmentResponse> findAll(Pageable pageable);

    List<DepartmentResponse> findAllActive();

    void delete(Long id);
}
