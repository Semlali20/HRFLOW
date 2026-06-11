package com.innovx.gestionrh.Config;

import com.innovx.gestionrh.Entity.Permission;
import com.innovx.gestionrh.Entity.Role;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.PermissionRepository;
import com.innovx.gestionrh.Repository.RoleRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** Resolved from env var ADMIN_EMAIL or Spring property admin.email — empty string if neither is set. */
    @Value("${ADMIN_EMAIL:${admin.email:}}")
    private String adminEmail;

    /** Resolved from env var ADMIN_PASSWORD or Spring property admin.password — empty string if neither is set. */
    @Value("${ADMIN_PASSWORD:${admin.password:}}")
    private String adminPassword;

    @PostConstruct
    @Transactional
    public void init() {
        log.info("Initializing RBAC permissions and roles...");
        initPermissions();
        initRoles();
        syncRolePermissions();   // keeps existing roles in sync when new permissions are added
        initAdminUser();
        log.info("RBAC initialization complete.");
    }

    // ── Permission Definitions ─────────────────────────────────────────────────

    private void initPermissions() {
        List<String[]> permDefs = Arrays.asList(
                // ── Interns ───────────────────────────────────────────────────
                new String[]{"INTERN_READ",           "INTERN",    "Read intern records"},
                new String[]{"INTERN_CREATE",         "INTERN",    "Create intern records"},
                new String[]{"INTERN_UPDATE",         "INTERN",    "Update intern records"},
                new String[]{"INTERN_DELETE",         "INTERN",    "Delete (deactivate) interns"},

                // ── Employees ─────────────────────────────────────────────────
                new String[]{"EMPLOYEE_READ",         "EMPLOYEE",  "Read employee records"},
                new String[]{"EMPLOYEE_CREATE",       "EMPLOYEE",  "Create employee records"},
                new String[]{"EMPLOYEE_UPDATE",       "EMPLOYEE",  "Update employee records"},
                new String[]{"EMPLOYEE_DELETE",       "EMPLOYEE",  "Delete (deactivate) employees"},

                // ── Departments ───────────────────────────────────────────────
                new String[]{"DEPARTMENT_READ",       "ORG",       "Read departments"},
                new String[]{"DEPARTMENT_CREATE",     "ORG",       "Create departments"},
                new String[]{"DEPARTMENT_UPDATE",     "ORG",       "Update departments"},
                new String[]{"DEPARTMENT_DELETE",     "ORG",       "Delete departments"},

                // ── Positions ─────────────────────────────────────────────────
                new String[]{"POSITION_READ",         "ORG",       "Read positions"},
                new String[]{"POSITION_CREATE",       "ORG",       "Create positions"},
                new String[]{"POSITION_UPDATE",       "ORG",       "Update positions"},
                new String[]{"POSITION_DELETE",       "ORG",       "Delete positions"},

                // ── Meetings ──────────────────────────────────────────────────
                new String[]{"MEETING_READ",          "INTERN",    "Read meetings"},
                new String[]{"MEETING_CREATE",        "INTERN",    "Create meetings"},
                new String[]{"MEETING_UPDATE",        "INTERN",    "Update meetings"},
                new String[]{"MEETING_DELETE",        "INTERN",    "Delete meetings"},

                // ── Documents ─────────────────────────────────────────────────
                new String[]{"DOCUMENT_READ",         "DOCUMENT",  "Read employee documents"},
                new String[]{"DOCUMENT_UPLOAD",       "DOCUMENT",  "Upload employee documents"},
                new String[]{"DOCUMENT_DELETE",       "DOCUMENT",  "Delete employee documents"},

                // ── Leave ─────────────────────────────────────────────────────
                new String[]{"LEAVE_REQUEST",         "LEAVE",     "Submit leave requests"},
                new String[]{"LEAVE_APPROVE",         "LEAVE",     "Approve leave requests"},
                new String[]{"LEAVE_REJECT",          "LEAVE",     "Reject leave requests"},
                new String[]{"LEAVE_READ_ALL",        "LEAVE",     "View all leave requests"},
                new String[]{"LEAVE_MANAGE_TYPES",    "LEAVE",     "Manage leave types and public holidays"},

                // ── CV & Offers ───────────────────────────────────────────────
                new String[]{"CV_UPLOAD",             "CV",        "Upload CVs"},
                new String[]{"CV_READ",               "CV",        "View CVs and applications"},
                new String[]{"CV_SHORTLIST",          "CV",        "Shortlist / score CV applications"},
                new String[]{"OFFER_CREATE",          "CV",        "Create stage offers"},
                new String[]{"OFFER_MANAGE",          "CV",        "Manage stage offers"},

                // ── Planning ──────────────────────────────────────────────────
                new String[]{"PLANNING_READ",         "PLANNING",  "View planning events"},
                new String[]{"PLANNING_CREATE",       "PLANNING",  "Create planning events"},
                new String[]{"PLANNING_UPDATE",       "PLANNING",  "Update planning events"},
                new String[]{"PLANNING_DELETE",       "PLANNING",  "Delete planning events"},

                // ── Reports ───────────────────────────────────────────────────
                new String[]{"REPORT_READ",           "REPORT",    "View reports"},
                new String[]{"REPORT_GENERATE",       "REPORT",    "Generate reports"},
                new String[]{"REPORT_EXPORT",         "REPORT",    "Export reports"},

                // ── Admin ─────────────────────────────────────────────────────
                new String[]{"USER_MANAGE",           "ADMIN",     "Manage users (view, update, deactivate)"},
                new String[]{"ROLE_MANAGE",           "ADMIN",     "Manage roles and permissions"},
                new String[]{"AUDIT_READ",            "ADMIN",     "View audit logs"},
                new String[]{"SYSTEM_CONFIG",         "ADMIN",     "System-level configuration"},

                // ── Salary / Payslips ─────────────────────────────────────────
                new String[]{"SALARY_READ",           "SALARY",    "View payslips and salary data"},
                new String[]{"SALARY_CREATE",         "SALARY",    "Create payslips"},
                new String[]{"SALARY_UPDATE",         "SALARY",    "Update payslips and change status"},
                new String[]{"SALARY_DELETE",         "SALARY",    "Delete (soft) payslips"},

                // ── Approvals ─────────────────────────────────────────────────
                new String[]{"APPROVAL_READ",         "APPROVAL",  "View pending approvals"},
                new String[]{"APPROVAL_PROCESS",      "APPROVAL",  "Approve or reject items"},

                // ── Performance Reviews ───────────────────────────────────────
                new String[]{"PERFORMANCE_READ",      "PERFORMANCE", "View performance reviews"},
                new String[]{"PERFORMANCE_WRITE",     "PERFORMANCE", "Create and edit performance reviews"},
                new String[]{"PERFORMANCE_DELETE",    "PERFORMANCE", "Delete performance reviews"},

                // ── Training & Development ────────────────────────────────────
                new String[]{"TRAINING_READ",         "TRAINING",  "View training sessions and enrollment"},
                new String[]{"TRAINING_WRITE",        "TRAINING",  "Create, update, and manage training sessions"}
        );

        for (String[] def : permDefs) {
            if (!permissionRepository.existsByName(def[0])) {
                permissionRepository.save(new Permission(null, def[0], def[1], def[2]));
                log.debug("Created permission: {}", def[0]);
            }
        }
    }

    // ── Role Definitions ───────────────────────────────────────────────────────

    private void initRoles() {
        List<Permission> allPerms = permissionRepository.findAll();
        Set<Permission> allPermsSet = new HashSet<>(allPerms);

        // ── ADMIN: full access ─────────────────────────────────────────────────
        createRoleIfAbsent("ADMIN", "Full system access — all permissions", allPermsSet);

        // ── STAGIAIRE_RH: intern & CV management ──────────────────────────────
        Set<Permission> stagiaireRhPerms = filterPerms(allPerms,
                "INTERN_READ", "INTERN_CREATE", "INTERN_UPDATE", "INTERN_DELETE",
                "MEETING_READ", "MEETING_CREATE", "MEETING_UPDATE", "MEETING_DELETE",
                "CV_UPLOAD", "CV_READ", "CV_SHORTLIST", "OFFER_CREATE", "OFFER_MANAGE",
                "PLANNING_READ", "PLANNING_CREATE",
                "LEAVE_REQUEST", "LEAVE_READ_ALL",
                "DOCUMENT_READ", "DOCUMENT_UPLOAD",
                "REPORT_READ");
        createRoleIfAbsent("STAGIAIRE_RH", "Intern HR manager", stagiaireRhPerms);

        // ── COLLABORATEUR_RH: employee management ──────────────────────────────
        Set<Permission> collaborateurRhPerms = filterPerms(allPerms,
                "EMPLOYEE_READ", "EMPLOYEE_CREATE", "EMPLOYEE_UPDATE", "EMPLOYEE_DELETE",
                "DEPARTMENT_READ", "POSITION_READ",
                "PLANNING_READ", "PLANNING_CREATE",
                "LEAVE_REQUEST", "LEAVE_APPROVE", "LEAVE_REJECT", "LEAVE_READ_ALL", "LEAVE_MANAGE_TYPES",
                "DOCUMENT_READ", "DOCUMENT_UPLOAD", "DOCUMENT_DELETE",
                "SALARY_READ", "SALARY_CREATE", "SALARY_UPDATE", "SALARY_DELETE",
                "REPORT_READ", "REPORT_GENERATE", "REPORT_EXPORT",
                "PERFORMANCE_READ", "PERFORMANCE_WRITE", "PERFORMANCE_DELETE",
                "TRAINING_READ", "TRAINING_WRITE");
        createRoleIfAbsent("COLLABORATEUR_RH", "Employee HR manager", collaborateurRhPerms);

        // ── MANAGER: team oversight ────────────────────────────────────────────
        Set<Permission> managerPerms = filterPerms(allPerms,
                "EMPLOYEE_READ", "INTERN_READ",
                "DEPARTMENT_READ", "POSITION_READ",
                "PLANNING_READ", "PLANNING_CREATE",
                "LEAVE_APPROVE", "LEAVE_REJECT", "LEAVE_READ_ALL",
                "DOCUMENT_READ",
                "REPORT_READ",
                "APPROVAL_READ", "APPROVAL_PROCESS",
                "PERFORMANCE_READ", "PERFORMANCE_WRITE",
                "TRAINING_READ");
        createRoleIfAbsent("MANAGER", "Team manager with approval rights", managerPerms);

        // ── EMPLOYEE: self-service ─────────────────────────────────────────────
        Set<Permission> employeePerms = filterPerms(allPerms,
                "LEAVE_REQUEST",
                "PLANNING_READ",
                "DOCUMENT_READ",
                "PERFORMANCE_READ",
                "TRAINING_READ");
        createRoleIfAbsent("EMPLOYEE", "Regular employee — self-service access", employeePerms);
    }

    // ── Admin User ────────────────────────────────────────────────────────────

    private void initAdminUser() {
        // adminEmail and adminPassword are injected via @Value (see field declarations above).
        // They resolve from env vars ADMIN_EMAIL / ADMIN_PASSWORD, Spring profile properties,
        // or the admin.email / admin.password properties — whichever is present first.
        if (adminEmail == null || adminEmail.isBlank()) {
            log.warn("ADMIN_EMAIL not set (env var or Spring property) — admin account NOT created for safety.");
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("ADMIN_PASSWORD not set (env var or Spring property) — admin account NOT created for safety.");
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists — skipping.");
            return;
        }
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("ADMIN role not found after initRoles()"));

        User admin = User.builder()
                .firstName("Admin")
                .lastName("System")
                .email(adminEmail)
                .title("System Administrator")
                .password(passwordEncoder.encode(adminPassword))
                .mustChangePassword(false)
                .lastPasswordChange(LocalDateTime.now())
                .roles(new HashSet<>(Set.of(adminRole)))
                .build();

        userRepository.save(admin);
        log.info("Admin user created — email: {} (password injected via ADMIN_PASSWORD)", adminEmail);
    }

    // ── Sync existing roles when new permissions are added ────────────────────

    /**
     * Called after every startup so that:
     *  • ADMIN always has 100 % of all permissions (even ones added later).
     *  • COLLABORATEUR_RH / MANAGER / EMPLOYEE receive any newly-introduced
     *    permissions that belong to their scope without manual DB work.
     */
    private void syncRolePermissions() {
        List<Permission> allPerms = permissionRepository.findAll();
        Set<Permission> allPermsSet = new HashSet<>(allPerms);

        // ADMIN — grant everything unconditionally
        roleRepository.findByName("ADMIN").ifPresent(role -> {
            if (!role.getPermissions().containsAll(allPermsSet)) {
                role.setPermissions(allPermsSet);
                roleRepository.save(role);
                log.info("Synced ADMIN role → now has {} permissions", allPermsSet.size());
            }
        });

        // COLLABORATEUR_RH — add PERFORMANCE + TRAINING if missing
        syncPermsForRole("COLLABORATEUR_RH", allPerms,
                "PERFORMANCE_READ", "PERFORMANCE_WRITE", "PERFORMANCE_DELETE",
                "TRAINING_READ", "TRAINING_WRITE");

        // MANAGER — add PERFORMANCE_READ/WRITE + TRAINING_READ if missing
        syncPermsForRole("MANAGER", allPerms,
                "PERFORMANCE_READ", "PERFORMANCE_WRITE",
                "TRAINING_READ");

        // EMPLOYEE — add PERFORMANCE_READ + TRAINING_READ if missing
        syncPermsForRole("EMPLOYEE", allPerms,
                "PERFORMANCE_READ", "TRAINING_READ");
    }

    private void syncPermsForRole(String roleName, List<Permission> allPerms, String... permNames) {
        roleRepository.findByName(roleName).ifPresent(role -> {
            Set<Permission> toAdd = filterPerms(allPerms, permNames);
            if (role.getPermissions().addAll(toAdd)) {
                roleRepository.save(role);
                log.info("Synced role {} — added missing permissions: {}", roleName, Arrays.toString(permNames));
            }
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void createRoleIfAbsent(String name, String description, Set<Permission> permissions) {
        if (!roleRepository.existsByName(name)) {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            role.setPermissions(permissions);
            roleRepository.save(role);
            log.info("Created role: {} ({} permissions)", name, permissions.size());
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
