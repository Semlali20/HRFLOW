package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Permission;
import com.innovx.gestionrh.Entity.Role;
import com.innovx.gestionrh.Repository.PermissionRepository;
import com.innovx.gestionrh.Repository.RoleRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.RoleService;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    // ── READ ──────────────────────────────────────────────────────────────────

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Role createRole(Role role) {
        if (role.getName() == null || role.getName().isBlank()) {
            throw new BusinessException("INVALID_ROLE_NAME",
                    "Role name must not be blank.");
        }

        String normalizedName = role.getName().trim();
        if (roleRepository.findByName(normalizedName).isPresent()) {
            throw new ConflictException(
                    "A role with name '" + normalizedName + "' already exists.");
        }

        role.setName(normalizedName);
        Role saved = roleRepository.save(role);
        log.info("Role '{}' (id={}) created.", saved.getName(), saved.getId());
        return saved;
    }

    // ── UPDATE PERMISSIONS ────────────────────────────────────────────────────

    @Override
    @Transactional
    public Role updateRolePermissions(Long id, List<String> permissionNames) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (permissionNames == null || permissionNames.isEmpty()) {
            throw new BusinessException("EMPTY_PERMISSIONS",
                    "Permission list must not be null or empty. "
                    + "Provide at least one permission name.");
        }

        // Validate all permission names before making any change
        Set<Permission> permissions = permissionNames.stream()
                .distinct()
                .map(name -> permissionRepository.findByName(name)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Permission", "name", name)))
                .collect(Collectors.toSet());

        role.setPermissions(permissions);
        Role saved = roleRepository.save(role);
        log.info("Permissions updated for role '{}' (id={}): {}",
                saved.getName(), saved.getId(), permissionNames);
        return saved;
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        // Prevent deleting a role that is currently assigned to users
        List<?> usersWithRole = userRepository.findByRoleName(role.getName());
        if (!usersWithRole.isEmpty()) {
            throw new BusinessException("ROLE_IN_USE",
                    "Role '" + role.getName() + "' is assigned to "
                    + usersWithRole.size() + " user(s) and cannot be deleted. "
                    + "Reassign those users to a different role first.");
        }

        roleRepository.deleteById(id);
        log.info("Role '{}' (id={}) deleted.", role.getName(), id);
    }
}
