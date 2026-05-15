package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.RefreshToken;
import com.innovx.gestionrh.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // JOIN FETCH so User is loaded eagerly — prevents LazyInitializationException
    @Query("SELECT rt FROM RefreshToken rt JOIN FETCH rt.user WHERE rt.token = :token")
    Optional<RefreshToken> findByToken(@Param("token") String token);

    Optional<RefreshToken> findByUser(User user);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    int deleteByUser(User user);
}
