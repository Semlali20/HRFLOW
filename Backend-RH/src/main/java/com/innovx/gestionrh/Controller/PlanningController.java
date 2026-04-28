package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.PlanningEvent;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.PlanningEventRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningEventRepository planningEventRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('PLANNING_READ')")
    public ResponseEntity<List<PlanningEvent>> getEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(planningEventRepository.findByDateRange(from, to));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('PLANNING_READ')")
    public ResponseEntity<List<PlanningEvent>> getAllEvents() {
        return ResponseEntity.ok(planningEventRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PLANNING_CREATE')")
    @LogActivity(action = "CREATE", module = "PLANNING", description = "Created planning event")
    public ResponseEntity<PlanningEvent> createEvent(
            @RequestBody PlanningEvent event,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User creator = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        event.setCreatedBy(creator);
        return ResponseEntity.ok(planningEventRepository.save(event));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PLANNING_UPDATE')")
    @LogActivity(action = "UPDATE", module = "PLANNING", description = "Updated planning event")
    public ResponseEntity<PlanningEvent> updateEvent(
            @PathVariable Long id, @RequestBody PlanningEvent updated) {
        return planningEventRepository.findById(id).map(event -> {
            event.setTitle(updated.getTitle());
            event.setDescription(updated.getDescription());
            event.setStartDateTime(updated.getStartDateTime());
            event.setEndDateTime(updated.getEndDateTime());
            event.setLocation(updated.getLocation());
            event.setType(updated.getType());
            return ResponseEntity.ok(planningEventRepository.save(event));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PLANNING_DELETE')")
    @LogActivity(action = "DELETE", module = "PLANNING", description = "Deleted planning event")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        planningEventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
