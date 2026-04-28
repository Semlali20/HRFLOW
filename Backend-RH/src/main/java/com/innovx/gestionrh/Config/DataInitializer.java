package com.innovx.gestionrh.Config;

import com.innovx.gestionrh.Entity.Permission;
import com.innovx.gestionrh.Entity.Role;
import com.innovx.gestionrh.Repository.PermissionRepository;
import com.innovx.gestionrh.Repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @PostConstruct
    @Transactional
    public void init() {
        log.info("Initializing RBAC permissions and roles...");
        initPermissions();
        initRoles();
        log.info("RBAC initialization complete.");
    }

    private void initPermissions() {
        List<String[]> permDefs = Arrays.asList(
                new String[]{"STAGIAIRE_READ",    "STAGIAIRE", "Read intern records"},
                new String[]{"STAGIAIRE_CREATE",  "STAGIAIRE", "Create interns"},
                new String[]{"STAGIAIRE_UPDATE",  "STAGIAIRE", "Update intern records"},
                new String[]{"STAGIAIRE_DELETE",  "STAGIAIRE", "Delete interns"},
                new String[]{"STAGIAIRE_EXPORT",  "STAGIAIRE", "Export intern data"},

                new String[]{"EMPLOYEE_READ",     "EMPLOYEE",  "Read employee records"},
                new String[]{"EMPLOYEE_CREATE",   "EMPLOYEE",  "Create employees"},
                new String[]{"EMPLOYEE_UPDATE",   "EMPLOYEE",  "Update employee records"},
                new String[]{"EMPLOYEE_DELETE",   "EMPLOYEE",  "Delete employees"},
                new String[]{"EMPLOYEE_EXPORT",   "EMPLOYEE",  "Export employee data"},

                new String[]{"LEAVE_REQUEST",     "LEAVE",     "Submit leave requests"},
                new String[]{"LEAVE_APPROVE",     "LEAVE",     "Approve leave requests"},
                new String[]{"LEAVE_REJECT",      "LEAVE",     "Reject leave requests"},
                new String[]{"LEAVE_READ_ALL",    "LEAVE",     "View all leave requests"},
                new String[]{"LEAVE_MANAGE_TYPES","LEAVE",     "Manage leave types"},

                new String[]{"CV_UPLOAD",         "CV",        "Upload CVs"},
                new String[]{"CV_READ",           "CV",        "View CVs"},
                new String[]{"CV_SHORTLIST",      "CV",        "Shortlist CV applications"},
                new String[]{"OFFER_CREATE",      "CV",        "Create stage offers"},
                new String[]{"OFFER_MANAGE",      "CV",        "Manage stage offers"},

                new String[]{"PLANNING_READ",     "PLANNING",  "View planning events"},
                new String[]{"PLANNING_CREATE",   "PLANNING",  "Create planning events"},
                new String[]{"PLANNING_UPDATE",   "PLANNING",  "Update planning events"},
                new String[]{"PLANNING_DELETE",   "PLANNING",  "Delete planning events"},

                new String[]{"REPORT_READ",       "REPORT",    "View reports"},
                new String[]{"REPORT_GENERATE",   "REPORT",    "Generate reports"},
                new String[]{"REPORT_EXPORT",     "REPORT",    "Export reports"},
                new String[]{"REPORT_SCHEDULE",   "REPORT",    "Schedule reports"},

                new String[]{"USER_MANAGE",       "ADMIN",     "Manage users"},
                new String[]{"ROLE_MANAGE",       "ADMIN",     "Manage roles"},
                new String[]{"AUDIT_READ",        "ADMIN",     "View audit logs"},
                new String[]{"SYSTEM_CONFIG",     "ADMIN",     "System configuration"},

                new String[]{"APPROVAL_READ",     "APPROVAL",  "View approvals"},
                new String[]{"APPROVAL_PROCESS",  "APPROVAL",  "Process approvals"},
                new String[]{"FILE_UPLOAD",       "FILE",      "Upload files"},
                new String[]{"FILE_DELETE",       "FILE",      "Delete files"},
                new String[]{"FILE_READ_ALL",     "FILE",      "View all files"}
        );

        for (String[] def : permDefs) {
            if (!permissionRepository.existsByName(def[0])) {
                permissionRepository.save(new Permission(null, def[0], def[1], def[2]));
            }
        }
    }

    private void initRoles() {
        List<Permission> allPerms = permissionRepository.findAll();
        Set<Permission> allPermsSet = new HashSet<>(allPerms);

        createRoleIfAbsent("ADMIN", "Full system access", allPermsSet);

        Set<Permission> stagiaireRhPerms = filterPerms(allPerms,
                "STAGIAIRE_READ", "STAGIAIRE_CREATE", "STAGIAIRE_UPDATE", "STAGIAIRE_DELETE", "STAGIAIRE_EXPORT",
                "CV_UPLOAD", "CV_READ", "CV_SHORTLIST", "OFFER_CREATE", "OFFER_MANAGE",
                "PLANNING_READ", "PLANNING_CREATE",
                "LEAVE_REQUEST", "LEAVE_READ_ALL",
                "FILE_UPLOAD", "FILE_READ_ALL", "REPORT_READ");
        createRoleIfAbsent("STAGIAIRE_RH", "Intern HR manager", stagiaireRhPerms);

        Set<Permission> collaborateurRhPerms = filterPerms(allPerms,
                "EMPLOYEE_READ", "EMPLOYEE_CREATE", "EMPLOYEE_UPDATE", "EMPLOYEE_DELETE", "EMPLOYEE_EXPORT",
                "PLANNING_READ", "PLANNING_CREATE",
                "LEAVE_REQUEST", "LEAVE_APPROVE", "LEAVE_REJECT", "LEAVE_READ_ALL",
                "FILE_UPLOAD", "FILE_READ_ALL", "REPORT_READ");
        createRoleIfAbsent("COLLABORATEUR_RH", "Employee HR manager", collaborateurRhPerms);

        Set<Permission> managerPerms = filterPerms(allPerms,
                "EMPLOYEE_READ", "STAGIAIRE_READ",
                "PLANNING_READ", "PLANNING_CREATE",
                "LEAVE_APPROVE", "LEAVE_REJECT", "LEAVE_READ_ALL",
                "REPORT_READ", "APPROVAL_READ", "APPROVAL_PROCESS");
        createRoleIfAbsent("MANAGER", "Team manager", managerPerms);
    }

    private void createRoleIfAbsent(String name, String description, Set<Permission> permissions) {
        if (!roleRepository.existsByName(name)) {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            role.setPermissions(permissions);
            roleRepository.save(role);
            log.info("Created role: {}", name);
        }
    }

    private Set<Permission> filterPerms(List<Permission> all, String... names) {
        Set<String> nameSet = new HashSet<>(Arrays.asList(names));
        Set<Permission> result = new HashSet<>();
        for (Permission p : all) {
            if (nameSet.contains(p.getName())) result.add(p);
        }
        return result;
    }
}
