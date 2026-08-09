/**
 * @project AncestorTree
 * @file src/messages/en/tree.ts
 * @description Family tree view labels and actions
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Tree = {
  title: 'Family tree',
  subtitle: 'Interactive pedigree chart',
  interactiveSubtitle:
    'Visual pedigree chart — click a person to view details',
  listTitle: 'Members by generation',
  listSubtitle:
    'Browse members grouped by generation — tap a name to view details',
  searchPlaceholder: 'Search by name...',
  empty: 'No family tree data yet',
  loading: 'Loading family tree...',
  actions: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset view',
    resetZoom: 'Reset zoom',
    expandAll: 'Expand all',
    expandShort: 'Expand',
    collapseAll: 'Collapse all',
    viewFromHere: 'View tree from here',
    viewFull: 'View full tree',
    exportGedcom: 'Export GEDCOM',
    focusPerson: 'Focus on person',
    backToRoot: 'Back to root',
  },
  guide: {
    title: 'Guide',
    maleBorder: 'Blue border',
    femaleBorder: 'Pink border',
    spouseLine: 'Pink line',
    mobileHint: 'On mobile: drag to pan, use +/- buttons to zoom',
  },
  canvas: {
    hintCompact: 'Drag to pan · Use +/- buttons to zoom',
    hintFull:
      'Drag to pan · Scroll to zoom · Click ± to collapse/expand branches',
  },
  toolbar: {
    searching: 'Searching...',
    noResults: 'No results found',
    selectChi: 'Select branch',
    allChi: 'All branches',
    chiN: 'Branch {n}',
    chiGeneration: 'Branch {chi} - Generation {generation}',
    orientation: 'Tree orientation',
    horizontal: 'Horizontal layout',
    horizontalTitle: 'Horizontal (left → right)',
    vertical: 'Vertical layout',
    verticalTitle: 'Vertical (top → bottom)',
    viewing: 'Viewing: {name}',
  },
  selected: {
    chi: 'Branch: {chi}',
    generation: 'Generation: {n}',
  },
  node: {
    living: 'Living',
    deceased: 'Deceased',
    generation: 'Generation {n}',
    spouse: 'Spouse',
  },
  toasts: {
    exportEmpty: 'Nothing to export yet',
    exportSuccess: 'GEDCOM exported successfully',
    exportError: 'Failed to export file',
  },
  elderly: {
    title: 'Family tree (simplified)',
    hint: 'Tap a name to view details',
    memberCount: '{count} people',
    childOf: 'child of {name}',
  },
} as const satisfies AppMessages['Tree'];
