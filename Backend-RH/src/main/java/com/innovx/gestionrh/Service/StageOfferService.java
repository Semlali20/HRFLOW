package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.StageOffer.OfferStatus;
import com.innovx.gestionrh.dto.request.StageOfferRequest;
import com.innovx.gestionrh.dto.response.StageOfferResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StageOfferService {

    StageOfferResponse create(StageOfferRequest request);

    StageOfferResponse update(Long id, StageOfferRequest request);

    StageOfferResponse findById(Long id);

    Page<StageOfferResponse> findAll(Pageable pageable);

    Page<StageOfferResponse> findByStatus(OfferStatus status, Pageable pageable);

    Page<StageOfferResponse> search(String query, Pageable pageable);

    StageOfferResponse updateStatus(Long id, OfferStatus status);

    void delete(Long id);
}
