/**
 * @project AncestorTree
 * @file src/app/(landing)/ancestral-hall/ancestral-hall-content.tsx
 * @description Client component for ancestral hall — gallery, ceremony schedule, map
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@components/ui';
import { useClanSettings } from '@hooks';
import { CLAN_FULL_NAME } from '@lib';
import type { CeremonyScheduleItem } from '@types';
import { BookOpen, Calendar, ImageIcon, Landmark, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function AncestralHallContent() {
  const t = useTranslations('Landing');
  const { data: cs, isLoading } = useClanSettings();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = (cs?.ancestral_hall_images ?? []) as string[];
  const coords = cs?.ancestral_hall_coordinates as {
    lat: number;
    lng: number;
  } | null;
  const ceremonies = (cs?.ceremony_schedule ?? []) as CeremonyScheduleItem[];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <Skeleton className="mx-auto h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
      <div className="space-y-3 text-center">
        <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          <Landmark className="h-8 w-8" />
          {t('pages.ancestralHall.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {cs?.clan_full_name ?? CLAN_FULL_NAME}
        </p>
      </div>

      {images.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <ImageIcon className="h-5 w-5" />
            {t('pages.ancestralHall.images')}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(url)}
                className="relative aspect-4/3 overflow-hidden rounded-lg border transition-opacity hover:opacity-90"
              >
                <Image
                  src={url}
                  alt={t('pages.ancestralHall.imageAlt', { n: i + 1 })}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Image
            src={selectedImage}
            alt={t('pages.ancestralHall.title')}
            width={1200}
            height={900}
            className="h-auto max-h-[85vh] w-auto max-w-full rounded-lg"
            sizes="(max-width: 1200px) 100vw, 1200px"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {cs?.ancestral_hall_history && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <BookOpen className="h-5 w-5" />
            {t('pages.ancestralHall.history')}
          </h2>
          <Card>
            <CardContent className="py-6">
              <p className="whitespace-pre-line text-gray-700">
                {cs.ancestral_hall_history}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {ceremonies.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="h-5 w-5" />
            {t('pages.ancestralHall.ceremonies')}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ceremonies.map((c, i) => (
              <Card key={i}>
                <CardHeader className="px-4 pt-3 pb-1">
                  <CardTitle className="text-sm font-semibold">
                    {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-xs text-gray-500">
                    {c.lunar_date && <span>AL: {c.lunar_date} · </span>}
                    {c.solar_date}
                  </p>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                      {c.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {cs?.ancestral_hall_address && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <MapPin className="h-5 w-5" />
            {t('pages.ancestralHall.location')}
          </h2>
          <Card>
            <CardContent className="py-4">
              <p className="text-gray-700">{cs.ancestral_hall_address}</p>
              {coords && (
                <div className="mt-3 h-64 overflow-hidden rounded-lg border">
                  <iframe
                    title={t('pages.ancestralHall.mapTitle')}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.01},${coords.lat - 0.01},${coords.lng + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {images.length === 0 &&
        !cs?.ancestral_hall_history &&
        !cs?.ancestral_hall_address &&
        ceremonies.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Landmark className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>{t('pages.ancestralHall.empty')}</p>
              <p className="mt-1 text-sm">{t('pages.ancestralHall.emptyHint')}</p>
            </CardContent>
          </Card>
        )}

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <Link href="/" className="text-sm text-primary hover:underline">
          {t('pageNav.home')}
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/family-tree" className="text-sm text-primary hover:underline">
          {t('pageNav.tree')}
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/council" className="text-sm text-primary hover:underline">
          {t('pageNav.council')}
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href="/register-member"
          className="text-sm text-primary hover:underline"
        >
          {t('pageNav.register')}
        </Link>
      </div>
    </div>
  );
}
