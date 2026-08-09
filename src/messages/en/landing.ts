/**
 * @project AncestorTree
 * @file src/messages/en/landing.ts
 * @description Public landing / welcome page copy
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Landing = {
  nav: {
    tree: 'Family tree',
    council: 'Council',
    ancestralHall: 'Ancestral hall',
    registerMember: 'Register',
  },
  hero: {
    badge: 'Open Source · MIT License · v2.5.0',
    tagline: 'Preserve the essence — Follow in our ancestors’ footsteps',
    ctaStart: 'Get started',
    ctaContact: 'Contact',
    login: 'Sign in',
    register: 'Sign up',
  },
  features: {
    title: 'Key features',
    subtitle:
      'A complete solution for family tree management — from pedigree charts to traditional ceremonies.',
    items: {
      tree: {
        title: 'Interactive family tree',
        desc: '10+ generations, zoom, pan, root filtering. SVG rendering with a custom layout engine.',
      },
      calendar: {
        title: 'Lunar calendar & memorial days',
        desc: 'Automatic lunar–solar conversion and yearly memorial reminders by traditional calendar.',
      },
      branches: {
        title: 'Branch / lineage management',
        desc: 'Clear branch structure, automatic generations, parent–child–spouse relationships.',
      },
      achievements: {
        title: 'Achievements & education fund',
        desc: 'Record achievements and manage the education fund with transparent accounting.',
      },
      charter: {
        title: 'Clan charter',
        desc: 'Store and display clan rules and teachings as versioned articles.',
      },
      cauDuong: {
        title: 'Cầu đương — ceremony rotation',
        desc: 'DFS algorithm automatically rotates fair ceremony assignments across families.',
      },
      relations: {
        title: 'Full family relationships',
        desc: 'Parents, siblings, spouses, children — add or remove directly from a profile.',
      },
      security: {
        title: 'Security & 4-tier roles',
        desc: 'Supabase Row Level Security: admin, editor, viewer, guest — protecting personal data.',
      },
      feed: {
        title: 'Community feed',
        desc: 'Posts, comments, likes, photo upload (up to 5/post), type filters, moderation.',
      },
      relationship: {
        title: 'Find relationship',
        desc: 'BFS pathfinding finds the kinship path between any two people in the tree.',
      },
      stats: {
        title: 'Advanced statistics',
        desc: 'Dashboard charts for generation, gender, and living/deceased distribution.',
      },
      exportImport: {
        title: 'Flexible export & import',
        desc: 'GEDCOM 7.0, CSV, Markdown, PDF — flexible genealogy data exchange.',
      },
      notifications: {
        title: 'Real-time notifications',
        desc: 'Bell icon plus 6 automatic notification types via DB triggers on comments and likes.',
      },
      hall: {
        title: 'Ancestral hall & council',
        desc: 'Public pages introducing the hall (gallery, map) and clan leadership.',
      },
      register: {
        title: 'Online member registration',
        desc: 'Distant descendants register online; admins approve. Honeypot anti-spam.',
      },
      search: {
        title: 'Smart search & SEO',
        desc: 'Fuzzy search (Fuse.js) with Vietnamese diacritics. Sitemap and Open Graph for public pages.',
      },
    },
  },
  screenshots: {
    title: 'Application UI',
    subtitle: 'Modern design, Vietnamese support, mobile-friendly.',
    tree: { alt: 'Interactive family tree', label: 'Family tree' },
    people: { alt: 'People management', label: 'People list' },
    admin: { alt: 'Admin panel', label: 'Admin panel' },
    mobile: { alt: 'Mobile interface', label: 'Mobile' },
  },
  guide: {
    title: 'User guide',
    subtitle: 'Overview of main features and how to use the app.',
    navTitle: 'Navigation',
    navItems: {
      home: { name: 'Home', desc: 'Overview, stats' },
      tree: { name: 'Family tree', desc: 'Pedigree chart' },
      people: { name: 'People', desc: 'Manage members' },
      directory: { name: 'Directory', desc: 'Contact book' },
      events: { name: 'Events', desc: 'Memorials, festivals' },
      feed: { name: 'Community feed', desc: 'Posts, comments, photos' },
      relationship: { name: 'Find relationship', desc: 'Path between 2 people' },
      stats: { name: 'Statistics', desc: 'Charts, analysis' },
      notifications: { name: 'Notifications', desc: 'Realtime updates' },
      achievements: { name: 'Achievements', desc: 'Descendant honors' },
      fund: { name: 'Education fund', desc: 'Income, scholarships' },
      charter: { name: 'Clan charter', desc: 'Teachings, rules' },
      cauDuong: { name: 'Cầu đương', desc: 'Ceremony rotation' },
      documents: { name: 'Document library', desc: 'Photos, PDF, video' },
      exportImport: { name: 'Export/Import', desc: 'GEDCOM, CSV, PDF' },
      admin: { name: 'Admin', desc: 'System settings' },
    },
    workflows: {
      addPerson: {
        title: 'Add a person',
        steps: [
          'Click "Add person" on the People page',
          'Enter name, gender, generation, birth year',
          'Select Father/Mother to create relationships automatically',
          'Click Save — the person appears on the tree',
        ],
      },
      viewTree: {
        title: 'View the family tree',
        steps: [
          'Open Family tree from the navigation',
          'Scroll to zoom, drag to pan',
          'Click a person to see details',
          'Choose "View tree from here" to filter a branch',
        ],
      },
      events: {
        title: 'Manage events & memorials',
        steps: [
          'Memorial dates are computed from lunar death dates',
          'Add events: Memorial, Festival, or Other',
          'Pick lunar date and related person',
          'Enable "Repeat yearly" for memorials',
        ],
      },
      backup: {
        title: 'Back up data',
        steps: [
          'Go to Admin → Backup & Restore',
          'Click "Export backup" to download a ZIP',
          'Restore by uploading the same ZIP',
          'Back up at least once a month',
        ],
      },
    },
    tipsTitle: 'Tips',
    tips: [
      'Start from the progenitor — enter highest generations first',
      'Select Father/Mother when creating a person so the tree updates',
      'Record lunar death dates — needed for accurate memorial days',
      'Back up regularly — genealogy data is priceless',
      'Use search when the tree is large (>50 people) — faster than scrolling',
    ],
  },
  quickstart: {
    title: 'Quick start',
    subtitle: 'Run locally — just Docker and about 10 minutes.',
    localTitle: 'Local Development',
    comment: '# Run locally (requires Docker + pnpm)',
    openAt: 'Open',
    loginHint: '— Sign in:',
    meta: 'Cost: $0 · Time: ~10 minutes · Full feature set',
  },
  faq: {
    title: 'Frequently asked questions',
    subtitle: 'Answers to common questions.',
    items: {
      dataLoss: {
        q: 'Will data be lost when the app updates?',
        a: 'No. Data is stored on Supabase cloud, separate from the app code, so updates do not affect it.',
      },
      backup: {
        q: 'How do I back up all data?',
        a: 'Admins go to Admin → Backup & Restore to download a ZIP of all data, and restore from that file when needed.',
      },
      capacity: {
        q: 'How many people does the app support?',
        a: 'No hard limit. Tested well with 500+ people and 10+ generations.',
      },
      permissions: {
        q: 'Who can edit data?',
        a: 'Admin has full access, Editor can add/edit/delete, Viewer can only view, Guest sees public info only.',
      },
    },
  },
  community: {
    title: 'Community',
    subtitle: 'Feedback, bug reports, or feature ideas.',
    bug: {
      title: 'Report a bug',
      desc: 'Found an issue? Please contact the administrators.',
      action: 'Contact',
    },
    feature: {
      title: 'Suggest a feature',
      desc: 'Have an idea? Share it with us.',
      action: 'Suggest',
    },
    discuss: {
      title: 'Discuss & support',
      desc: 'Ask questions and talk with clan administrators.',
      action: 'Discuss',
    },
  },
  contact: {
    title: 'Contact',
    subtitle:
      'This software serves {clanFullName}. {clanName} descendants, please reach out for support.',
    author: 'Author',
    verifyTitle: 'Account verification guide',
    verifySteps: [
      'Sign up on the registration page',
      'Contact an Admin via email or phone above',
      'Provide your name and relationship to the clan',
      'Admin verifies — you get full access',
    ],
    registerCta: 'Create an account',
  },
  members: {
    title: 'Join {clanName}',
    subtitle:
      'Sign in to see the full family tree, or register if you are a distant descendant.',
    login: 'Sign in',
    registerMember: 'Register as member',
  },
  footer: {
    tree: 'Family tree',
    council: 'Council',
    contact: 'Contact',
    copyright: '© {year} {clanFullName}',
  },
  pageNav: {
    home: 'Home',
    tree: 'Family tree',
    council: 'Clan council',
    hall: 'Ancestral hall',
    register: 'Register as member',
  },
  pages: {
    familyTree: {
      title: 'Family tree',
      description: 'View the clan pedigree chart (guest mode).',
      legendDesktop:
        '<male>Blue border</male> = Male · <female>Pink border</female> = Female · Drag to pan · Use +/- to zoom',
      legendMobile:
        'Drag to pan · Use +/- to zoom · Tap ± on a branch to collapse/expand',
    },
    council: {
      title: 'Clan council',
      description: 'Leadership and council members.',
      membersTitle: 'Leadership',
      historyTitle: 'Clan history',
      missionTitle: 'Mission & vision',
      generalInfo: 'General information',
      patriarch: 'Progenitor',
      foundingYear: 'Founding year',
      origin: 'Place of origin',
      empty: 'Council information has not been updated yet.',
      emptyHint: 'Please contact the administrators.',
    },
    ancestralHall: {
      title: 'Ancestral hall',
      description: 'Hall introduction, photos, and location.',
      images: 'Photos',
      imageAlt: 'Ancestral hall {n}',
      history: 'Hall history',
      ceremonies: 'Annual ceremony schedule',
      location: 'Location',
      mapTitle: 'Ancestral hall map',
      empty: 'Ancestral hall information has not been updated yet.',
      emptyHint: 'Please contact the administrators.',
    },
    registerMember: {
      title: 'Member registration',
      description: 'Distant descendants submit an online registration.',
      forDescendants:
        'For {clanName} descendants living far away who want to join the family tree',
      formTitle: 'Registration details',
      formDesc:
        'Fill in the form below. Administrators will review and contact you. Fields marked (*) are required.',
      fullName: 'Full name *',
      fullNamePlaceholder: 'John Doe',
      gender: 'Gender *',
      selectGender: 'Select gender',
      birthYear: 'Birth year',
      birthPlace: 'Birthplace / hometown',
      birthPlacePlaceholder: 'Hanoi',
      phone: 'Phone',
      email: 'Email',
      parentName: 'Parent name (for matching)',
      parentPlaceholder: 'Parent full name for matching',
      generation: 'Generation (self-reported)',
      chi: 'Branch (self-reported)',
      relationship: 'Relationship',
      relationshipPlaceholder: 'Grandchild of X',
      notes: 'Notes',
      notesPlaceholder: 'Additional information...',
      submitError: 'Failed to submit. Please try again.',
      submitting: 'Submitting...',
      submit: 'Submit registration',
      successTitle: 'Registration submitted!',
      successBody:
        'Your information was sent to the {clanName} administrators. After review, you will be added to the family tree.',
      success: 'Registration submitted. An admin will review it soon.',
      backHome: 'Back to home',
      viewCouncil: 'View clan council',
    },
  },
} as const satisfies AppMessages['Landing'];
