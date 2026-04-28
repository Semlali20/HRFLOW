package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.Role;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.RoleRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.annotation.LogActivity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @LogActivity(action = "UPDATE_ROLES", module = "ADMIN", description = "Updated user roles")
    public ResponseEntity<?> updateUserRoles(
            @PathVariable Long id,
            @RequestBody Map<String, List<String>> body) {
        return userRepository.findById(id).map(user -> {
            List<String> roleNames = body.get("roles");
            Set<Role> roles = roleNames.stream()
                    .map(name -> roleRepository.findByName(name)
                            .orElseThrow(() -> new RuntimeException("Role not found: " + name)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @LogActivity(action = "DELETE", module = "ADMIN", description = "Soft-deleted user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setDeleted(true);
            userRepository.save(user);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
