import { MenuItem } from './menu.model';
export const MENU: MenuItem[] = [
  {
    label: 'MAIN',
    isTitle: true,
  },
  {
    label: 'Dashboard',
    link: '/dashboard',
    icon: 'bxs-dashboard',
  },
  {
    label: 'Notifications',
    link: '/chat',
    icon: 'bxs-bell',
  },
  {
    label: 'Day-off Request',
    link: '/dayoff',
    icon: 'bxs-calendar-check',
  },
  {
    label: 'Planning',
    link: '/planning',
    icon: 'bxs-calendar-alt',
  },

  {
    label: 'EMPLOYEE MANAGER',
    isTitle: true,
  },
  {
    label: 'Employees',
    link: '/collaborateur',
    icon: 'bxs-group',
  },
  {
    label: 'Interns',
    link: '/stagiaires/grid',
    icon: 'bxs-graduation',
  },
  {
    label: 'Leave Management',
    link: '/leave',
    icon: 'bxs-door-open',
  },
  {
    label: 'Attendances',
    link: '/attendance',
    icon: 'bxs-time',
  },
  {
    label: 'Recruitment & CV',
    link: '/UploadsCv',
    icon: 'bxs-user-plus',
  },
  {
    label: 'Salary',
    link: '/salary',
    icon: 'bxs-wallet',
  },

  {
    label: 'ANALYTICS',
    isTitle: true,
  },
  {
    label: 'Reports',
    link: '/reports',
    icon: 'bxs-bar-chart-alt-2',
  },
  {
    label: 'Audit Log',
    link: '/audit',
    icon: 'bxs-list-check',
  },

  {
    label: 'ADMINISTRATION',
    isTitle: true,
  },
  {
    label: 'User Management',
    link: '/admin/users',
    icon: 'bxs-user-badge',
  },
  {
    label: 'Role Management',
    link: '/admin/roles',
    icon: 'bxs-shield',
  },

  {
    label: 'GENERAL',
    isTitle: true,
  },
  {
    label: 'File Manager',
    link: '/filemanager',
    icon: 'bxs-folder',
  },
  {
    label: 'Settings',
    link: '/settings',
    icon: 'bxs-cog',
  },
];
