package com.innovx.gestionrh.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PublicHolidayResponse {
    private Long id;
    private LocalDate holidayDate;
    private String name;
    private String countryCode;
    private boolean recurring;
    private LocalDateTime createdAt;
}
