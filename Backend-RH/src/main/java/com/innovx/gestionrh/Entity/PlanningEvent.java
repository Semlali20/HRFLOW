package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "planning_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanningEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    private String location;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventType type = EventType.MEETING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum EventType {
        MEETING, INTERVIEW, TRAINING, HOLIDAY, DEADLINE, OTHER
    }
}
