package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.PublicHolidayRequest;
import com.innovx.gestionrh.dto.response.PublicHolidayResponse;

import java.util.List;

public interface PublicHolidayService {

    PublicHolidayResponse create(PublicHolidayRequest request);

    PublicHolidayResponse update(Long id, PublicHolidayRequest request);

    List<PublicHolidayResponse> findAll(String countryCode);

    void delete(Long id);
}
