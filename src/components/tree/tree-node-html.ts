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
  const genderAccent =
    gender === 1 ? 'border-l-blue-400' : 'border-l-pink-400';
  const selectedRing = isSelected ? 'ring-2 ring-primary ring-offset-2' : '';
  return `h-full flex-1 min-w-0 bg-card border border-border/70 border-l-2 ${genderAccent} ${selectedRing} rounded-md shadow-sm hover:shadow-md transition-all p-1.5 flex items-center gap-1.5 relative select-none`;
}

function buildPersonCardHtml(
  person: Person,
  isSelected: boolean,
  isPublic: boolean
): string {
  const { givenName, familyLine } = getPersonTreeNameParts(person);
  const isDead = !person.is_living
    ? `<span class="text-[10px] text-muted-foreground/70 pointer-events-none absolute top-0.5 right-1">†</span>`
    : '';
  const avatarHtml = person.avatar_url
    ? `<img src="${escapeHtml(person.avatar_url)}" class="h-7 w-7 shrink-0 rounded-full object-cover pointer-events-none border border-muted" loading="lazy" />`
    : `<div class="h-7 w-7 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-semibold pointer-events-none">${escapeHtml(getInitials(givenName))}</div>`;
  const showYears = !person.is_living || !isPublic;
  const yearsText = showYears
    ? [person.birth_year, person.death_year].filter(Boolean).join('–')
    : '';
  const yearsHtml = yearsText
    ? ` <span class="text-muted-foreground font-normal">(${escapeHtml(yearsText)})</span>`
    : '';
  const familyHtml = familyLine
    ? `<span class="text-[10px] text-muted-foreground line-clamp-1 leading-tight pointer-events-none">${escapeHtml(familyLine)}</span>`
    : '';

  return `
    <div data-person-id="${escapeHtml(person.id)}" class="${buildNodeCardClass(person.gender, isSelected)}">
      ${avatarHtml}
      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-semibold line-clamp-1 leading-tight pointer-events-none">${escapeHtml(givenName)}${yearsHtml}</p>
        ${familyHtml}
      </div>
      ${isDead}
    </div>
  `;
}

/** Marriage link between two cards of the same couple. `w-4` must equal COUPLE_GAP. */
const COUPLE_CONNECTOR_HTML =
  '<div class="h-0.5 w-4 shrink-0 self-center bg-pink-400 pointer-events-none"></div>';

export function buildNodeHtml(
  data: HierarchyPersonNode,
  selectedPersonId: string | null,
  isPublic = false
): string {
  const cards = [
    buildPersonCardHtml(data.person, selectedPersonId === data.person.id, isPublic),
  ];
  for (const spouse of data.spouses) {
    cards.push(COUPLE_CONNECTOR_HTML);
    cards.push(
      buildPersonCardHtml(spouse, selectedPersonId === spouse.id, isPublic)
    );
  }
  return `<div class="flex h-full w-full items-stretch">${cards.join('')}</div>`;
}
