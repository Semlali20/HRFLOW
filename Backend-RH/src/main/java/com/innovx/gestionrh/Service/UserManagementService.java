package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.UserUpdateRequest;
import com.innovx.gestionrh.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserManagementService {

    UserResponse findById(Long id);

    Page<UserResponse> findAll(Pageable pageable);

    Page<UserResponse> search(String query, Pageable pageable);

    UserResponse update(Long id, UserUpdateRequest request);

    void softDelete(Long id);
}
