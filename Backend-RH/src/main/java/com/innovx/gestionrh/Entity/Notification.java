package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications",
       indexes = {
               @Index(name = "idx_notif_recipient", columnList = "recipient_id"),
               @Index(name = "idx_notif_created_at", columnList = "created_at"),
               @Index(name = "idx_notif_is_read",   columnList = "is_read")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = "recipient")
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    /** Optional deep-link for the frontend (e.g., "/leaves/42"). */
    @Column(name = "action_url", length = 300)
    private String actionUrl;
}
