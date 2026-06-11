package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Refresh token for JWT token rotation.
 * One active refresh token per user — replaced on every use.
 * No @Version: the entire row is deleted and re-created on refresh.
 */
@Entity
@Table(name = "refresh_tokens",
       uniqueConstraints = @UniqueConstraint(name = "uk_refresh_token_value", columnNames = "token"),
       indexes = {
               @Index(name = "idx_rt_user_id",     columnList = "user_id"),
               @Index(name = "idx_rt_expiry_date", columnList = "expiry_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "token", nullable = false, length = 500)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;
}
