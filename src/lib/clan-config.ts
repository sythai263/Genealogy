/**
 * @project AncestorTree
 * @file src/lib/clan-config.ts
 * @description Clan name configuration from environment variables
 * @version 1.1.0
 * @updated 2026-07-19
 */

// Short clan name (e.g. "Họ Lê Sỹ") — override via NEXT_PUBLIC_CLAN_NAME
export const CLAN_NAME = process.env.NEXT_PUBLIC_CLAN_NAME || 'Họ Lê Sỹ';

// Full clan name with location — override via NEXT_PUBLIC_CLAN_FULL_NAME
export const CLAN_FULL_NAME =
  process.env.NEXT_PUBLIC_CLAN_FULL_NAME || 'Họ Lê Sỹ';

// Derived: first letter of the family surname (e.g. "L" from "Họ Lê Sỹ")
const parts = CLAN_NAME.split(' ');
export const CLAN_INITIAL =
  parts.length > 1 ? parts[parts.length - 1][0] : parts[0][0];

// Derived: location subtitle (e.g. from full name minus short name)
export const CLAN_SUBTITLE = CLAN_FULL_NAME.startsWith(CLAN_NAME)
  ? CLAN_FULL_NAME.slice(CLAN_NAME.length).trim()
  : '';
