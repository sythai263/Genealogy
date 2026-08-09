/**
 * @project AncestorTree
 * @file src/messages/en/index.ts
 * @description English message root — satisfies AppMessages from Vietnamese
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';
import { Achievements } from './achievements';
import { Admin } from './admin';
import { Auth } from './auth';
import { CauDuong } from './cauDuong';
import { Charter } from './charter';
import { Common } from './common';
import { Contributions } from './contributions';
import { Directory } from './directory';
import { Documents } from './documents';
import { Events } from './events';
import { Feed } from './feed';
import { Fund } from './fund';
import { Help } from './help';
import { Landing } from './landing';
import { Layout } from './layout';
import { Metadata } from './metadata';
import { Notifications } from './notifications';
import { People } from './people';
import { Relationship } from './relationship';
import { Settings } from './settings';
import { Stats } from './stats';
import { Tree } from './tree';
import { Validation } from './validation';

export const en = {
  Common,
  Layout,
  Auth,
  Landing,
  People,
  Tree,
  Directory,
  Events,
  Contributions,
  Achievements,
  Fund,
  Charter,
  CauDuong,
  Feed,
  Notifications,
  Documents,
  Relationship,
  Stats,
  Help,
  Settings,
  Admin,
  Validation,
  Metadata,
} as const satisfies AppMessages;
