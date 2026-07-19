/**
 * @project AncestorTree
 * @file src/constants/tree.ts
 * @description Layout and interaction constants for the family tree
 * @version 2.1.0
 * @updated 2026-07-19
 */

export const NODE_WIDTH = 100;
export const NODE_HEIGHT = 64;
export const LEVEL_HEIGHT = 80;
export const SIBLING_GAP = 12;
export const BRANCH_GAP = 30;
export const COUPLE_GAP = 12;

/** Sibling spacing along Y for horizontal (LTR) tree nodeSize[0] */
export const TREE_NODE_SIZE_Y = NODE_HEIGHT + 24;
/** Depth spacing along X for horizontal (LTR) tree nodeSize[1] */
export const TREE_NODE_SIZE_X = NODE_WIDTH + 80;

/** Sibling spacing along X for vertical (TTB) tree nodeSize[0] */
export const TREE_VERTICAL_NODE_SIZE_X = NODE_WIDTH + 24;
/** Depth spacing along Y for vertical (TTB) tree nodeSize[1] */
export const TREE_VERTICAL_NODE_SIZE_Y = NODE_HEIGHT + 80;

/**
 * Collapse nodes at depth >= this value on initial load.
 * Depth 0 = root → depth 2 = 3rd generation visible, deeper collapsed.
 */
export const TREE_DEFAULT_COLLAPSE_DEPTH = 2;

export const TREE_VIRTUAL_ROOT_ID = '__clan_root__';

/** Query param for focusing the tree on a person subtree (`/tree?root=<uuid>`). */
export const TREE_ROOT_QUERY_PARAM = 'root';

export const TREE_SEARCH_DEBOUNCE_MS = 300;
export const TREE_SEARCH_MIN_CHARS = 2;

export const TREE_ZOOM_MIN = 0.08;
export const TREE_ZOOM_MAX = 3;
export const TREE_ZOOM_IN_FACTOR = 1.3;
export const TREE_ZOOM_OUT_FACTOR = 0.7;
export const TREE_ZOOM_MOBILE_SCALE = 0.6;
export const TREE_ZOOM_INITIAL_SCALE = 0.85;
export const TREE_MOBILE_BREAKPOINT = 768;

export const TREE_TRANSITION_MS = 450;
export const TREE_EXIT_TRANSITION_MS = 300;
export const TREE_FOCUS_TRANSITION_MS = 750;
export const TREE_COLLAPSE_BTN_RADIUS = 8;
