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

function buildNodeCardClass(
  gender: number,
  isSelected: boolean,
  isInLaw: boolean
): string {
  const genderStyle =
    gender === 1
      ? 'bg-sky-100/80 border-sky-300/70 dark:bg-sky-400/25 dark:border-sky-400/50'
      : 'bg-rose-100/80 border-rose-300/70 dark:bg-rose-400/25 dark:border-rose-400/50';
  const inLawStyle = isInLaw ? 'border-dashed opacity-90' : '';
  const selectedRing = isSelected ? 'border-primary shadow-md' : '';
  return `h-full flex-1 min-w-0 border rounded ${genderStyle} ${inLawStyle} ${selectedRing} shadow-sm hover:shadow-md transition-all p-1.5 flex flex-col items-center justify-center gap-0.5 relative select-none overflow-hidden`;
}

/** Diagonal ribbon strip across the top-right corner marks deceased members. */
const DECEASED_RIBBON_HTML =
  '<div class="pointer-events-none absolute -right-2.5 top-1 h-2 w-9 rotate-45 bg-foreground/80"></div>';

function buildPersonCardHtml(
  person: Person,
  isSelected: boolean,
  isPublic: boolean,
  isInLaw: boolean
): string {
  const { givenName, familyLine } = getPersonTreeNameParts(person);
  const avatarHtml = person.avatar_url
    ? `<img src="${escapeHtml(person.avatar_url)}" class="h-6 w-6 shrink-0 rounded-full object-cover pointer-events-none ${person.is_living ? '' : 'grayscale'}" loading="lazy" />`
    : person.is_living
      ? `<div class="h-6 w-6 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-semibold pointer-events-none">${escapeHtml(getInitials(givenName))}</div>`
      : `<div class="h-6 w-6 shrink-0 rounded-full bg-muted-foreground/25 text-muted-foreground flex items-center justify-center text-[10px] font-semibold pointer-events-none">${escapeHtml(getInitials(givenName))}</div>`;
  const showYears = !person.is_living || !isPublic;
  const yearsText = showYears
    ? person.is_living
      ? `(${person.birth_year ?? '...'})`
      : `(${person.birth_year ?? '...'} - ${person.death_year ?? '...'})`
    : '';
  const yearsHtml = yearsText
    ? `<p class="w-full text-center text-[9px] text-muted-foreground line-clamp-1 leading-tight pointer-events-none">${escapeHtml(yearsText)}</p>`
    : '';
  const familyHtml = familyLine
    ? `<span class="font-normal text-muted-foreground">${escapeHtml(familyLine)} </span>`
    : '';

  return `
    <div data-person-id="${escapeHtml(person.id)}" class="${buildNodeCardClass(person.gender, isSelected, isInLaw)}">
      ${avatarHtml}
      <p class="w-full text-center text-[11px] line-clamp-1 leading-tight pointer-events-none">${familyHtml}<span class="font-bold">${escapeHtml(givenName)}</span></p>
      ${yearsHtml}
      ${person.is_living ? '' : DECEASED_RIBBON_HTML}
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
    buildPersonCardHtml(
      data.person,
      selectedPersonId === data.person.id,
      isPublic,
      false
    ),
  ];
  for (const spouse of data.spouses) {
    cards.push(COUPLE_CONNECTOR_HTML);
    cards.push(
      buildPersonCardHtml(
        spouse,
        selectedPersonId === spouse.id,
        isPublic,
        true
      )
    );
  }
  return `<div class="flex h-full w-full items-stretch">${cards.join('')}</div>`;
}
