import { MenuItem } from './menu.model';
export const MENU: MenuItem[] = [
  {
    label: '',
  },
  {
    label: 'Home',
    link: '/dashboard',
    icon: 'bx-home',
  },
  {
    label: 'Calendrier',
    link: '/calendar',
    icon: 'bx-calendar',
  },
  {
    label: 'Stagiaires',
    link: '/stagiaires/list',
    icon: 'bx-user',
  },
  {
    label: 'File Manager',
    link: '/filemanager',
    icon: 'bx-folder',
  },

  {
    label: 'collaborateurs',
    link: '/collaborateur',
    icon: 'bx-group',
  },
  {
    label: 'List notification',
    link: '/chat',
    icon: 'bx-bell',
  }
];
