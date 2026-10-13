/**
 * @project AncestorTree
 * @file src/messages/en/landing.ts
 * @description Public landing / welcome page copy
 * @version 2.0.0
 * @updated 2026-10-09
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
    tagline: 'Preserve the essence — Follow in our ancestors’ footsteps',
    ctaTree: 'View family tree',
    ctaAbout: 'About the clan',
    login: 'Sign in',
    register: 'Sign up',
  },
  about: {
    title: 'About the clan',
    historyTitle: 'Clan history',
    missionTitle: 'Mission & vision',
    generalInfo: 'General information',
    patriarch: 'Founding ancestor',
    foundingYear: 'Founding year',
    origin: 'Origin',
    contactTitle: 'Contact the council',
    empty: 'Clan information has not been updated yet.',
    emptyHint: 'Administrators can update it under Admin → Clan settings.',
  },
  explore: {
    title: 'Explore',
    subtitle: 'Learn about your roots and connect with fellow descendants.',
    tree: { title: 'Family tree', desc: 'View the pedigree chart across generations.' },
    council: { title: 'Clan council', desc: 'Leadership and history of the clan.' },
    hall: { title: 'Ancestral hall', desc: 'Photos, location and annual ceremonies.' },
    register: { title: 'Register as member', desc: 'Distant descendants can join the family tree.' },
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
    hall: 'Ancestral hall',
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
