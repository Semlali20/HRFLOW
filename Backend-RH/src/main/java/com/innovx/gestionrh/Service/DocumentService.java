package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.DocumentCategory;
import com.innovx.gestionrh.dto.request.DocumentUploadRequest;
import com.innovx.gestionrh.dto.response.DocumentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {

    DocumentResponse upload(MultipartFile file, DocumentUploadRequest request);

    DocumentResponse findById(Long id);

    Page<DocumentResponse> findByEmployee(Long employeeId, Pageable pageable);

    List<DocumentResponse> findByEmployeeAndCategory(Long employeeId, DocumentCategory category);

    List<DocumentResponse> findExpiringSoon(int daysAhead);

    void delete(Long id);
}
