import { MenuItem } from './menu.model';
export const MENU: MenuItem[] = [
  {
    label: 'PRINCIPAL',
    isTitle: true,
  },
  {
    label: 'Tableau de bord',
    link: '/dashboard',
    icon: 'bxs-dashboard',
    // always visible — no permission required
  },
  {
    label: 'Notifications',
    link: '/chat',
    icon: 'bxs-bell',
    // always visible
  },
  {
    label: 'Demande de congé',
    link: '/dayoff',
    icon: 'bxs-calendar-check',
    // always visible — every employee can submit a leave request
  },
  {
    label: 'Planning',
    link: '/planning',
    icon: 'bxs-calendar-alt',
    permission: 'PLANNING_READ',
  },

  {
    label: 'GESTION RH',
    isTitle: true,
  },
  {
    label: 'Employés',
    link: '/collaborateur',
    icon: 'bxs-group',
    permission: 'EMPLOYEE_READ',
  },
  {
    label: 'Stagiaires',
    link: '/stagiaires',
    icon: 'bxs-graduation',
    permission: 'INTERN_READ',
  },
  {
    label: 'Congés',
    icon: 'bxs-door-open',
    permission: 'LEAVE_READ_ALL',
    subItems: [
      { label: 'Liste des demandes', link: '/leave',         permission: 'LEAVE_READ_ALL' },
      { label: 'Soldes de congés',   link: '/leave/balance', permission: 'LEAVE_READ_ALL' },
    ]
  },
  {
    label: 'Présences',
    link: '/attendance',
    icon: 'bxs-time',
    permission: 'EMPLOYEE_READ',
  },
  {
    label: 'Recrutement & CV',
    link: '/recruitment',
    icon: 'bxs-user-plus',
    permission: 'CV_READ',
  },
  {
    label: 'Salaires',
    link: '/salary',
    icon: 'bxs-wallet',
    permission: 'SALARY_READ',
  },
  {
    label: 'Documents',
    link: '/documents',
    icon: 'bxs-folder-open',
    permission: 'DOCUMENT_READ',
  },
  {
    label: 'Réunions & Suivis',
    link: '/meetings',
    icon: 'bxs-conversation',
    permission: 'MEETING_READ',
  },

  {
    label: 'ORGANISATION',
    isTitle: true,
  },
  {
    label: 'Départements & Postes',
    link: '/org',
    icon: 'bxs-building-house',
    permission: 'DEPARTMENT_READ',
  },
  {
    label: 'Jours Fériés',
    link: '/public-holidays',
    icon: 'bxs-party',
    permission: 'LEAVE_MANAGE_TYPES',
  },

  {
    label: 'ANALYTIQUE',
    isTitle: true,
  },
  {
    label: 'Statistiques',
    link: '/statistics',
    icon: 'bxs-chart',
    permission: 'REPORT_READ',
  },
  {
    label: 'Rapports',
    link: '/reports',
    icon: 'bxs-bar-chart-alt-2',
    permission: 'REPORT_GENERATE',
  },
  {
    label: 'Journal d\'audit',
    link: '/audit',
    icon: 'bxs-list-check',
    permission: 'AUDIT_READ',
  },

  {
    label: 'ADMINISTRATION',
    isTitle: true,
  },
  {
    label: 'Utilisateurs',
    link: '/admin/users',
    icon: 'bxs-user-badge',
    permission: 'USER_MANAGE',
  },
  {
    label: 'Rôles & Permissions',
    link: '/admin/roles',
    icon: 'bxs-shield',
    permission: 'ROLE_MANAGE',
  },

  {
    label: 'GÉNÉRAL',
    isTitle: true,
  },
  {
    label: 'Gestionnaire fichiers',
    link: '/filemanager',
    icon: 'bxs-folder',
    permission: 'DOCUMENT_READ',
  },
  {
    label: 'Paramètres',
    link: '/settings',
    icon: 'bxs-cog',
    // always visible
  },
];
