/**
 * @project AncestorTree
 * @file src/messages/en/layout.ts
 * @description Sidebar navigation, theme, roles, auth footer labels
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Layout = {
  groups: {
    main: 'Main menu',
    account: 'Account',
    admin: 'Admin',
  },
  nav: {
    home: 'Home',
    tree: 'Family tree',
    people: 'People',
    directory: 'Directory',
    events: 'Memorial calendar',
    contributions: 'Suggestions',
    achievements: 'Achievements',
    fund: 'Education fund',
    charter: 'Clan charter',
    relationship: 'Find relationship',
    stats: 'Statistics',
    cauDuong: 'Cầu đương',
    feed: 'Community feed',
    notifications: 'Notifications',
    documents: 'Documents',
    help: 'Help',
    profile: 'Profile',
    security: 'Security (MFA)',
    adminDashboard: 'Dashboard',
    adminUsers: 'Users',
    adminContributions: 'Edit suggestions',
    adminEvents: 'Manage events',
    adminAchievements: 'Manage achievements',
    adminFund: 'Manage fund & scholarships',
    adminCharter: 'Manage charter',
    adminCauDuong: 'Manage Cầu đương',
    adminDocuments: 'Manage documents',
    adminFeed: 'Manage posts',
    adminExport: 'Export data',
    adminImport: 'Import GEDCOM',
    adminSpouses: 'Add spouses',
    adminDuplicates: 'Duplicates',
    adminRegistrations: 'Registrations',
    adminSettings: 'Settings',
    adminBackup: 'Backup data',
  },
  auth: {
    login: 'Sign in',
    register: 'Sign up',
    logout: 'Sign out',
    profile: 'Profile',
    security: 'Security (MFA)',
    account: 'Account',
    enterAdmin: 'Admin',
    enterApp: 'Enter app',
  },
  landingNav: {
    tree: 'Family tree',
    council: 'Council',
    hall: 'Ancestral hall',
    register: 'Register',
  },
  theme: {
    label: 'Theme',
    modeTitle: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  roles: {
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer',
    guest: 'Guest',
  },
  elderlyMode: {
    label: 'Elderly mode',
    on: 'On',
    off: 'Off',
    toggleOn: 'Enable large display mode',
    toggleOff: 'Disable large display mode',
    shortOn: 'Large text: ON',
    shortOff: 'Large text',
  },
} as const satisfies AppMessages['Layout'];
