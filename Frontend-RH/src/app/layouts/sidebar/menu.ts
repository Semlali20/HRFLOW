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
  },
  {
    label: 'Notifications',
    link: '/chat',
    icon: 'bxs-bell',
  },
  {
    label: 'Demande de congé',
    link: '/dayoff',
    icon: 'bxs-calendar-check',
  },
  {
    label: 'Planning',
    link: '/planning',
    icon: 'bxs-calendar-alt',
  },

  {
    label: 'GESTION RH',
    isTitle: true,
  },
  {
    label: 'Employés',
    link: '/collaborateur',
    icon: 'bxs-group',
  },
  {
    label: 'Stagiaires',
    link: '/stagiaires',
    icon: 'bxs-graduation',
  },
  {
    label: 'Congés',
    icon: 'bxs-door-open',
    subItems: [
      { label: 'Liste des demandes', link: '/leave' },
      { label: 'Soldes de congés',   link: '/leave/balance' },
    ]
  },
  {
    label: 'Présences',
    link: '/attendance',
    icon: 'bxs-time',
  },
  {
    label: 'Recrutement & CV',
    link: '/recruitment',
    icon: 'bxs-user-plus',
  },
  {
    label: 'Salaires',
    link: '/salary',
    icon: 'bxs-wallet',
  },
  {
    label: 'Documents',
    link: '/documents',
    icon: 'bxs-folder-open',
  },
  {
    label: 'Réunions & Suivis',
    link: '/meetings',
    icon: 'bxs-conversation',
  },

  {
    label: 'ORGANISATION',
    isTitle: true,
  },
  {
    label: 'Départements & Postes',
    link: '/org',
    icon: 'bxs-building-house',
  },
  {
    label: 'Jours Fériés',
    link: '/public-holidays',
    icon: 'bxs-party',
  },

  {
    label: 'ANALYTIQUE',
    isTitle: true,
  },
  {
    label: 'Statistiques',
    link: '/statistics',
    icon: 'bxs-chart',
  },
  {
    label: 'Rapports',
    link: '/reports',
    icon: 'bxs-bar-chart-alt-2',
  },
  {
    label: 'Journal d\'audit',
    link: '/audit',
    icon: 'bxs-list-check',
  },

  {
    label: 'ADMINISTRATION',
    isTitle: true,
  },
  {
    label: 'Utilisateurs',
    link: '/admin/users',
    icon: 'bxs-user-badge',
  },
  {
    label: 'Rôles & Permissions',
    link: '/admin/roles',
    icon: 'bxs-shield',
  },

  {
    label: 'GÉNÉRAL',
    isTitle: true,
  },
  {
    label: 'Gestionnaire fichiers',
    link: '/filemanager',
    icon: 'bxs-folder',
  },
  {
    label: 'Paramètres',
    link: '/settings',
    icon: 'bxs-cog',
  },
];
