package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.InternStatus;
import com.innovx.gestionrh.dto.request.InternDocumentRequest;
import com.innovx.gestionrh.dto.request.InternRequest;
import com.innovx.gestionrh.dto.response.InternDocumentResponse;
import com.innovx.gestionrh.dto.response.InternResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InternService {

    InternResponse create(InternRequest request);

    InternResponse update(Long id, InternRequest request);

    InternResponse findById(Long id);

    Page<InternResponse> findAll(Pageable pageable);

    Page<InternResponse> search(String query, Pageable pageable);

    Page<InternResponse> findByStatus(InternStatus status, Pageable pageable);

    InternResponse updateStatus(Long id, InternStatus status);

    void delete(Long id);

    // ── Document tracking ──

    List<InternDocumentResponse> getDocuments(Long internId);

    InternDocumentResponse updateDocument(Long internId, InternDocumentRequest request);
}
