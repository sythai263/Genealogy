/**
 * @project AncestorTree
 * @file src/components/tree/tree-node-html.ts
 * @description HTML string builders for tree node cards rendered inside the
 *              D3 foreignObject — person card, couple connector, node wrapper
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { getInitials, getPersonTreeNameParts } from '@lib';
import type { HierarchyPersonNode, Person } from '@types';

/** Names come from user input and are interpolated into a raw HTML string. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildNodeCardClass(gender: number, isSelected: boolean): string {
  const genderColor = gender === 1 ? 'border-blue-400' : 'border-pink-400';
  const selectedRing = isSelected ? 'ring-2 ring-primary ring-offset-2' : '';
  return `h-full flex-1 min-w-0 bg-card border ${genderColor} ${selectedRing} rounded-md shadow-sm hover:shadow-md transition-all p-1.5 flex flex-col items-center justify-center relative select-none`;
}

function buildPersonCardHtml(person: Person, isSelected: boolean): string {
  const { givenName, familyLine } = getPersonTreeNameParts(person);
  const isDead = !person.is_living
    ? `<span class="text-xs text-muted-foreground pointer-events-none absolute top-0.5 right-1.5">†</span>`
    : '';
  const avatarHtml = person.avatar_url
    ? `<img src="${escapeHtml(person.avatar_url)}" class="h-5 w-5 mb-0.5 rounded-full object-cover pointer-events-none border border-muted shadow-sm" loading="lazy" />`
    : `<div class="h-5 w-5 mb-0.5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold border border-muted shadow-sm pointer-events-none">${escapeHtml(getInitials(givenName))}</div>`;
  const familyHtml = familyLine
    ? `<span class="text-[10px] text-muted-foreground text-center line-clamp-1 leading-tight pointer-events-none px-0.5">${escapeHtml(familyLine)}</span>`
    : '';

  return `
    <div data-person-id="${escapeHtml(person.id)}" class="${buildNodeCardClass(person.gender, isSelected)}">
      ${avatarHtml}
      <span class="text-xs font-semibold text-center line-clamp-1 leading-tight pointer-events-none px-0.5">${escapeHtml(givenName)}</span>
      ${familyHtml}
      ${isDead}
    </div>
  `;
}

/** Marriage link between two cards of the same couple. `w-4` must equal COUPLE_GAP. */
const COUPLE_CONNECTOR_HTML =
  '<div class="h-0.5 w-4 shrink-0 self-center bg-pink-400 pointer-events-none"></div>';

export function buildNodeHtml(
  data: HierarchyPersonNode,
  selectedPersonId: string | null
): string {
  const cards = [buildPersonCardHtml(data.person, selectedPersonId === data.person.id)];
  for (const spouse of data.spouses) {
    cards.push(COUPLE_CONNECTOR_HTML);
    cards.push(buildPersonCardHtml(spouse, selectedPersonId === spouse.id));
  }
  return `<div class="flex h-full w-full items-stretch">${cards.join('')}</div>`;
}
