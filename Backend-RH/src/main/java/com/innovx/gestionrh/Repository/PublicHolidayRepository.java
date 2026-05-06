package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.PublicHoliday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PublicHolidayRepository extends JpaRepository<PublicHoliday, Long> {

    List<PublicHoliday> findByCountryCodeOrderByHolidayDateAsc(String countryCode);

    boolean existsByHolidayDateAndCountryCode(LocalDate holidayDate, String countryCode);

    /**
     * Returns holiday dates in a given range for working-day calculation.
     * Used by LeaveService to count actual working days excluding public holidays.
     */
    @Query("SELECT ph.holidayDate FROM PublicHoliday ph " +
           "WHERE ph.holidayDate BETWEEN :start AND :end " +
           "AND ph.countryCode = :countryCode")
    List<LocalDate> findHolidayDatesBetween(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("countryCode") String countryCode);
}
