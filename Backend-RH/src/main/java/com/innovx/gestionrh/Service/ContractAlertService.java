package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractAlertService {

    private final CollaborateursRepository collaborateursRepo;

    public record ContractAlert(
            Long employeeId,
            String fullName,
            String contractType,
            LocalDate endDate,
            long daysLeft
    ) {}

    /**
     * Returns employees whose CDD/STAGE/CIVP/FREELANCE/INTERIM contract
     * expires within the next {@code daysAhead} days.
     */
    public List<ContractAlert> getExpiringContracts(int daysAhead) {
        LocalDate from = LocalDate.now();
        LocalDate to   = from.plusDays(daysAhead);

        return collaborateursRepo.findAll().stream()
                .filter(c -> c.getContractEndDate() != null
                          && !c.getContractEndDate().isBefore(from)
                          && !c.getContractEndDate().isAfter(to)
                          && c.getContractType() != null
                          && !"CDI".equalsIgnoreCase(c.getContractType().name()))
                .map(c -> new ContractAlert(
                        c.getId(),
                        c.getFirstName() + " " + c.getLastName(),
                        c.getContractType().name(),
                        c.getContractEndDate(),
                        ChronoUnit.DAYS.between(from, c.getContractEndDate())
                ))
                .sorted(Comparator.comparingLong(ContractAlert::daysLeft))
                .collect(Collectors.toList());
    }

    /** Scheduled daily weekday check — logs warnings for contracts expiring within 30 days. */
    @Scheduled(cron = "0 0 8 * * MON-FRI")
    public void checkExpiringContracts() {
        List<ContractAlert> alerts = getExpiringContracts(30);
        if (alerts.isEmpty()) return;
        log.warn("[ContractAlert] {} contract(s) expiring within 30 days:", alerts.size());
        alerts.forEach(a -> log.warn("  -> {} | {} | expires {} ({} days)",
                a.fullName(), a.contractType(), a.endDate(), a.daysLeft()));
    }
}
