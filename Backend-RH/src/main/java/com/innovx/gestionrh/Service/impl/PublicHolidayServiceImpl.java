package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.PublicHoliday;
import com.innovx.gestionrh.Repository.PublicHolidayRepository;
import com.innovx.gestionrh.Service.PublicHolidayService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.PublicHolidayRequest;
import com.innovx.gestionrh.dto.response.PublicHolidayResponse;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.PublicHolidayMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicHolidayServiceImpl implements PublicHolidayService {

    private final PublicHolidayRepository publicHolidayRepository;
    private final PublicHolidayMapper publicHolidayMapper;

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "PUBLIC_HOLIDAY")
    public PublicHolidayResponse create(PublicHolidayRequest request) {
        String countryCode = request.getCountryCode() != null ? request.getCountryCode() : "MA";
        if (publicHolidayRepository.existsByHolidayDateAndCountryCode(
                request.getHolidayDate(), countryCode)) {
            throw new ConflictException("A public holiday on " + request.getHolidayDate()
                    + " already exists for country code '" + countryCode + "'.");
        }
        PublicHoliday holiday = publicHolidayMapper.toEntity(request);
        return publicHolidayMapper.toResponse(publicHolidayRepository.save(holiday));
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "PUBLIC_HOLIDAY")
    public PublicHolidayResponse update(Long id, PublicHolidayRequest request) {
        PublicHoliday holiday = publicHolidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PublicHoliday", "id", id));

        String newCountryCode = request.getCountryCode() != null ? request.getCountryCode() : "MA";
        boolean dateChanged = !holiday.getHolidayDate().equals(request.getHolidayDate());
        boolean countryChanged = !holiday.getCountryCode().equals(newCountryCode);

        if ((dateChanged || countryChanged)
                && publicHolidayRepository.existsByHolidayDateAndCountryCode(
                        request.getHolidayDate(), newCountryCode)) {
            throw new ConflictException("A public holiday on " + request.getHolidayDate()
                    + " already exists for country code '" + newCountryCode + "'.");
        }

        publicHolidayMapper.updateEntity(request, holiday);
        return publicHolidayMapper.toResponse(publicHolidayRepository.save(holiday));
    }

    @Override
    public List<PublicHolidayResponse> findAll(String countryCode) {
        String code = (countryCode == null || countryCode.isBlank()) ? "MA" : countryCode.trim().toUpperCase();
        return publicHolidayRepository.findByCountryCodeOrderByHolidayDateAsc(code)
                .stream().map(publicHolidayMapper::toResponse).toList();
    }

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "PUBLIC_HOLIDAY")
    public void delete(Long id) {
        if (!publicHolidayRepository.existsById(id)) {
            throw new ResourceNotFoundException("PublicHoliday", "id", id);
        }
        publicHolidayRepository.deleteById(id);
    }
}
