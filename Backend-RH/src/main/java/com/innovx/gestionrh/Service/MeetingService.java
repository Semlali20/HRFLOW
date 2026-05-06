package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.MeetingRequest;
import com.innovx.gestionrh.dto.response.MeetingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MeetingService {

    MeetingResponse create(MeetingRequest request);

    MeetingResponse update(Long id, MeetingRequest request);

    MeetingResponse findById(Long id);

    Page<MeetingResponse> findAll(Pageable pageable);

    List<MeetingResponse> findByIntern(Long internId);

    void delete(Long id);
}
