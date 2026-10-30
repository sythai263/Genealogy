/**
 * @project AncestorTree
 * @file src/components/layout/clan-logo.tsx
 * @description Clan "LS" monogram — vector outlines traced from the original
 *              mark; currentColor renders black in light mode, white in dark
 * @version 4.1.0
 * @updated 2026-10-30
 */

import { cn } from '@lib';

/** Outlines of the L and S glyphs in a 766x478 viewBox. */
const LS_PATHS = [
  'M0.6 0.6 146 0 147.8 1.2 148.6 353.4 341.2 354.4 246.6 476.6 2 477 0.2 475.8Z',
  'M452.4 0.4 752.4 0.6 749.8 5.8 657.6 124.6 447 125 438 126 425.8 128.8 415.2 134.2 408.6 142.6 406 153 406 163 409.6 174.4 416.2 181.8 424.8 186.2 443 190 593 190 615 191 647 195 676.2 201.8 699.4 210.6 721.8 224.2 739.8 241.2 747.4 251.6 755.4 266.6 763 292 766 319 765 342 763 356 757.2 379.2 752.4 391.4 737.8 415.8 720.8 433.8 699.4 448.4 683.4 456.4 659.2 465.2 624 473 588 477 311.8 477.2 311.6 475.6 316.2 469.2 406.4 354.4 578 354 589 353 606.4 348.4 616.8 339.8 620.2 333.2 622 326 622 314 620.4 306.6 618.6 302.4 612.8 295.2 602.4 289.6 585 286 431 286 405 284 375 279 345.6 270.4 324.6 260.4 311.2 251.8 292.2 234.8 276.6 212.4 270.8 199.2 265 178 263 165 263 132 266 114 272.6 91.6 281.6 73.6 295.2 55.2 309.2 42.2 324.6 31.6 343.6 21.6 355.8 16.8 396 6 424 2Z',
];

interface ClanLogoProps {
  /** Rendered height in px — width follows the mark aspect ratio. */
  size?: number;
  className?: string;
}

export function ClanLogo({ size = 32, className }: ClanLogoProps) {
  return (
    <svg
      viewBox="0 0 766 478"
      height={size}
      fill="currentColor"
      role="img"
      aria-label="LS"
      className={cn('w-auto shrink-0', className)}
    >
      {LS_PATHS.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </svg>
  );
}
