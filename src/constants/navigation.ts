/**
 * @project AncestorTree
 * @file src/constants/navigation.ts
 * @description Sidebar navigation definitions — main, account and admin
 *              groups. Each item maps a Layout.nav translation key to a URL
 *              and lucide icon.
 * @version 1.0.0
 * @updated 2026-10-29
 */

import {
  Home,
  GitBranchPlus,
  Users,
  BookUser,
  Calendar,
  FileText,
  Settings,
  UserCog,
  ClipboardList,
  UserCircle,
  ShieldCheck,
  Trophy,
  BookOpen,
  ScrollText,
  RotateCcw,
  DatabaseBackup,
  HelpCircle,
  Download,
  Upload,
  Copy,
  Route,
  BarChart3,
  MessageSquare,
  Bell,
  Landmark,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import type { AppMessages } from '@messages/types';

export type LayoutNavKey = keyof AppMessages['Layout']['nav'];

export interface NavItemDef {
  titleKey: LayoutNavKey;
  url: string;
  icon: LucideIcon;
  /** Only shown to admin/editor — home entry links to /admin */
  adminHome?: boolean;
  /** Hidden for plain viewers (directory contains private data) */
  viewerHidden?: boolean;
}

export const MAIN_NAV_ITEMS: NavItemDef[] = [
  { titleKey: 'home', url: '/admin', icon: Home, adminHome: true },
  { titleKey: 'tree', url: '/tree', icon: GitBranchPlus },
  { titleKey: 'people', url: '/people', icon: Users },
  { titleKey: 'directory', url: '/directory', icon: BookUser, viewerHidden: true },
  { titleKey: 'events', url: '/events', icon: Calendar },
  { titleKey: 'contributions', url: '/contributions', icon: ClipboardList },
  { titleKey: 'achievements', url: '/achievements', icon: Trophy },
  { titleKey: 'fund', url: '/fund', icon: BookOpen },
  { titleKey: 'charter', url: '/charter', icon: ScrollText },
  { titleKey: 'relationship', url: '/relationship', icon: Route },
  { titleKey: 'stats', url: '/stats', icon: BarChart3 },
  { titleKey: 'cauDuong', url: '/cau-duong', icon: RotateCcw },
  { titleKey: 'feed', url: '/feed', icon: MessageSquare },
  { titleKey: 'notifications', url: '/notifications', icon: Bell },
  { titleKey: 'documents', url: '/documents', icon: FileText },
  { titleKey: 'help', url: '/help', icon: HelpCircle },
];

export const ACCOUNT_NAV_ITEMS: NavItemDef[] = [
  { titleKey: 'profile', url: '/settings/profile', icon: UserCircle },
  { titleKey: 'security', url: '/settings/security', icon: ShieldCheck },
];

export const ADMIN_NAV_ITEMS: NavItemDef[] = [
  { titleKey: 'adminDashboard', url: '/admin', icon: Settings },
  { titleKey: 'adminUsers', url: '/admin/users', icon: UserCog },
  { titleKey: 'adminContributions', url: '/admin/contributions', icon: ClipboardList },
  { titleKey: 'adminEvents', url: '/admin/events', icon: Calendar },
  { titleKey: 'adminAchievements', url: '/admin/achievements', icon: Trophy },
  { titleKey: 'adminFund', url: '/admin/fund', icon: BookOpen },
  { titleKey: 'adminCharter', url: '/admin/charter', icon: ScrollText },
  { titleKey: 'adminCauDuong', url: '/admin/cau-duong', icon: RotateCcw },
  { titleKey: 'adminDocuments', url: '/admin/documents', icon: FileText },
  { titleKey: 'adminFeed', url: '/admin/feed', icon: MessageSquare },
  { titleKey: 'adminExport', url: '/admin/export', icon: Download },
  { titleKey: 'adminImport', url: '/admin/import', icon: Upload },
  { titleKey: 'adminSpouses', url: '/admin/spouses', icon: Heart },
  { titleKey: 'adminDuplicates', url: '/admin/duplicates', icon: Copy },
  { titleKey: 'adminRegistrations', url: '/admin/registrations', icon: Landmark },
  { titleKey: 'adminSettings', url: '/admin/settings', icon: Settings },
  { titleKey: 'adminBackup', url: '/admin/backup', icon: DatabaseBackup },
];
