package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.Permission;
import com.innovx.gestionrh.Entity.Role;
import com.innovx.gestionrh.Repository.PermissionRepository;
import com.innovx.gestionrh.Repository.RoleRepository;
import com.innovx.gestionrh.annotation.LogActivity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(permissionRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @LogActivity(action = "CREATE", module = "ADMIN", description = "Created role")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        return ResponseEntity.ok(roleRepository.save(role));
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @LogActivity(action = "UPDATE_PERMISSIONS", module = "ADMIN", description = "Updated role permissions")
    public ResponseEntity<?> updateRolePermissions(
            @PathVariable Long id,
            @RequestBody Map<String, List<String>> body) {
        return roleRepository.findById(id).map(role -> {
            List<String> permNames = body.get("permissions");
            Set<Permission> perms = permNames.stream()
                    .map(name -> permissionRepository.findByName(name)
                            .orElseThrow(() -> new RuntimeException("Permission not found: " + name)))
                    .collect(Collectors.toSet());
            role.setPermissions(perms);
            return ResponseEntity.ok(roleRepository.save(role));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
