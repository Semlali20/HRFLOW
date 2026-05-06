package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Role;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.RoleRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.UserManagementService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.UserUpdateRequest;
import com.innovx.gestionrh.dto.response.UserResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<UserResponse> search(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return findAll(pageable);
        }
        return userRepository.search(query.trim(), pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "USER")
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = findEntityById(id);

        // Optimistic locking check
        if (request.getVersion() != null && !request.getVersion().equals(user.getVersion())) {
            throw new BusinessException("CONCURRENT_MODIFICATION",
                    "User record was modified by another session. Please reload and try again.");
        }

        // Email uniqueness check
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email '" + request.getEmail() + "' is already in use.");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setTitle(request.getTitle());

        if (request.getRoles() != null) {
            if (request.getRoles().isEmpty()) {
                throw new BusinessException("NO_ROLES",
                        "A user must have at least one role.");
            }
            Set<Role> roles = resolveRoles(request.getRoles());
            user.setRoles(roles);
        }

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "USER")
    public void softDelete(Long id) {
        User user = findEntityById(id);

        if (user.isDeleted()) {
            throw new BusinessException("ALREADY_DELETED",
                    "User account is already deactivated.");
        }
        // Prevent deleting yourself via management endpoint
        user.setDeleted(true);
        userRepository.save(user);
        log.info("User id={} soft-deleted.", id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
            roles.add(role);
        }
        return roles;
    }

    /** Builds UserResponse including flattened role and permission name lists. */
    private UserResponse toResponse(User user) {
        UserResponse response = userMapper.toResponse(user);

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName).sorted().toList();
        response.setRoles(roleNames);

        List<String> permissionNames = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(perm -> perm.getName())
                .distinct().sorted().toList();
        response.setPermissions(permissionNames);

        return response;
    }
}
