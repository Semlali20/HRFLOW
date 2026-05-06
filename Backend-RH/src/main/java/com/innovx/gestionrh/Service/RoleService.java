package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Permission;
import com.innovx.gestionrh.Entity.Role;

import java.util.List;

/**
 * Contract for managing application roles and permissions.
 * Only administrators with the {@code ROLE_MANAGE} authority should invoke these operations.
 */
public interface RoleService {

    /**
     * Returns all roles defined in the system.
     */
    List<Role> getAllRoles();

    /**
     * Returns all permissions defined in the system.
     */
    List<Permission> getAllPermissions();

    /**
     * Creates a new role.
     *
     * @throws com.innovx.gestionrh.exception.BusinessException  if {@code role.name} is blank
     * @throws com.innovx.gestionrh.exception.ConflictException  if a role with the same name already exists
     */
    Role createRole(Role role);

    /**
     * Replaces the permission set of an existing role.
     *
     * @param id              the role's primary key
     * @param permissionNames names of the permissions to assign (replaces existing set)
     * @throws com.innovx.gestionrh.exception.ResourceNotFoundException if the role or any permission is not found
     * @throws com.innovx.gestionrh.exception.BusinessException         if {@code permissionNames} is null or empty
     */
    Role updateRolePermissions(Long id, List<String> permissionNames);

    /**
     * Deletes a role by its primary key.
     *
     * @throws com.innovx.gestionrh.exception.ResourceNotFoundException if no role with the given id exists
     * @throws com.innovx.gestionrh.exception.BusinessException         if the role is still assigned to one or more users
     */
    void deleteRole(Long id);
}
