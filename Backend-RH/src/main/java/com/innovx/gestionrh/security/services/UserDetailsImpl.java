package com.innovx.gestionrh.security.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.innovx.gestionrh.Entity.Role;
import com.innovx.gestionrh.Entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;

    private final Long id;
    private final String lastname;
    private final String firstname;
    private final String email;
    private final String title;
    private final String roleName;
    @JsonIgnore
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String lastname, String firstname, String email,
                           String password, String title, String roleName,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.lastname = lastname;
        this.firstname = firstname;
        this.email = email;
        this.password = password;
        this.title = title;
        this.roleName = roleName;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(p -> new SimpleGrantedAuthority(p.getName()))
                .collect(Collectors.toSet());

        String primaryRole = user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("USER");

        return new UserDetailsImpl(
                user.getId(),
                user.getLastName(),
                user.getFirstName(),
                user.getEmail(),
                user.getPassword(),
                user.getTitle(),
                primaryRole,
                authorities);
    }

    /** Primary role name, kept for backward compatibility with existing frontend contract. */
    public String getUserRole() {
        return roleName;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserDetailsImpl)) return false;
        return Objects.equals(id, ((UserDetailsImpl) o).id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
