/**
 * @project AncestorTree
 * @file src/messages/en/help.ts
 * @description In-app help guide content
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Help = {
  title: 'Help guide',
  subtitle:
    'Detailed guide to the features of the digital family tree app.',
  navSection: {
    title: 'Navigation',
    items: {
      home: {
        name: 'Home',
        desc: 'Stats overview: total people, generations, families, upcoming events, featured charter.',
      },
      tree: {
        name: 'Family tree',
        desc: 'Interactive pedigree: zoom, pan, root filter. Supports 10+ generations, SVG rendering.',
      },
      people: {
        name: 'People',
        desc: 'List and manage people: add, edit, delete, search. Full personal details.',
      },
      directory: {
        name: 'Directory',
        desc: 'Contact book: phone, email, Zalo. Visible only to signed-in members.',
      },
      events: {
        name: 'Memorial calendar',
        desc: 'Memorial and festival days by lunar calendar. Auto from lunar death date, yearly repeat.',
      },
      contributions: {
        name: 'Suggestions',
        desc: 'Submit edit suggestions: add/edit people or events. Admin approves before applying.',
      },
      achievements: {
        name: 'Achievements',
        desc: 'Honor board: Study, Career, Contribution, Other. Recognize outstanding descendants.',
      },
      fund: {
        name: 'Education fund',
        desc: 'Transparent fund ledger and scholarships for outstanding descendants. Admin managed.',
      },
      charter: {
        name: 'Clan charter',
        desc: 'Clan teachings, rules, and advice. Stored as versioned articles.',
      },
      cauDuong: {
        name: 'Cầu đương',
        desc: 'Rotating ceremony duty among families. Automatic fair DFS algorithm.',
      },
      documents: {
        name: 'Documents',
        desc: 'Export genealogy as a traditional book. Ordered by generation from the progenitor.',
      },
    },
  },
  workflows: {
    title: 'Step-by-step guides',
    addPerson: {
      title: 'Add a person',
      steps: [
        'Go to People → click "Add person" (top right)',
        'Required: Full name, Gender',
        'Recommended: Generation (1 = progenitor), Birth year, Lunar death date (for memorials)',
        'Select Father / Mother — creates relationships and shows on the tree',
        'Optional: Biography, Occupation, Contact (phone, email, Zalo)',
      ],
      tip: 'Tip: Enter from the highest generation (progenitor) downward so the tree displays correctly.',
    },
    viewTree: {
      title: 'View the family tree',
      steps: [
        'Open Family tree from the navigation',
        'Zoom: mouse wheel or pinch on trackpad',
        'Pan: click and drag on empty space',
        'Details: click a person → info popup',
        'Filter branch: click person → "View tree from here" → only that branch',
      ],
      tip: 'Tip: For large trees (>50 people), use "View tree from here" to focus on one branch.',
    },
    events: {
      title: 'Manage events & memorials',
      steps: [
        'Memorial dates are computed from lunar death dates (entered on the person page)',
        'Add manually: click "Add event"',
        'Types: Memorial, Festival (Lunar New Year, Full Moon…), Other (clan meeting…)',
        'Enter lunar date (e.g. 12/3) + related person',
        'Enable "Repeat yearly" for memorials and festivals',
      ],
      tip: 'Note: Lunar dates are converted to solar dates to show upcoming events.',
    },
  },
  roles: {
    title: 'User roles',
    roleHeader: 'Role',
    permissionsHeader: 'Permissions',
    admin: {
      role: 'Admin',
      permissions:
        'Full access: CRUD all data, user management, roles, system settings',
    },
    editor: {
      role: 'Editor',
      permissions:
        'Add / edit / delete people, events, achievements, fund, charter, cầu đương',
    },
    viewer: {
      role: 'Viewer',
      permissions:
        'View all information (including contacts), cannot edit',
    },
    guest: {
      role: 'Guest',
      permissions:
        'View public information only; no phone/email/Zalo',
    },
  },
  tips: {
    title: 'Tips',
    items: [
      'Start from the progenitor — enter highest generations first for an accurate tree',
      'Select Father/Mother when creating a person — tree and relationships update automatically',
      'Record lunar death dates — the most important field for yearly memorial accuracy',
      'Back up regularly — genealogy data is priceless; at least once a month',
      'Use search for large trees (>50 people) — much faster than scrolling',
      'Add relationships from the detail page — open person → Relations → Add child or spouse',
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    items: {
      dataLoss: {
        q: 'Will data be lost when the app updates?',
        a: 'No. Data is stored on Supabase cloud and is unaffected by app updates.',
      },
      backup: {
        q: 'How do I back up all data?',
        a: 'Admins go to Admin → Backup & Restore to download a ZIP of all data and restore when needed.',
      },
      capacity: {
        q: 'How many people does the app support?',
        a: 'No hard limit. Tested well with 500+ people and 10+ generations. Tree and search stay smooth.',
      },
      relations: {
        q: 'How do I add family relationships (spouse, children)?',
        a: 'Open the person detail page → Family relations → "Add relationship" → "Add child" or "Add spouse". Both sides update automatically.',
      },
      cauDuong: {
        q: 'How does Cầu đương work?',
        a: 'Cầu đương is the custom of rotating memorial ceremony duties among families. The app uses DFS (depth-first tree traversal) for fair automatic rotation. Admin creates a new round → system assigns → can adjust manually.',
      },
    },
  },
} as const satisfies AppMessages['Help'];
