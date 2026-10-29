/**
 * @project AncestorTree
 * @file src/components/fund/fund-scholarship-dialog.tsx
 * @description "Nominate scholarship" dialog — owns its own form state and
 *              create mutation; renders trigger button + dialog
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PersonCombobox } from '@components/people';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import { FUND_SCHOLARSHIP_TYPE_ORDER } from '@constants';
import { useCreateScholarship } from '@hooks';
import type {
  CreateScholarshipInput,
  Person,
  ScholarshipType,
} from '@types';

export function FundScholarshipDialog() {
  const t = useTranslations('Admin');
  const tFund = useTranslations('Fund');
  const tCommon = useTranslations('Common');
  const createSch = useCreateScholarship();

  const [open, setOpen] = useState(false);
  const [schPerson, setSchPerson] = useState<Person | null>(null);
  const [schType, setSchType] = useState<ScholarshipType>('hoc_bong');
  const [schAmount, setSchAmount] = useState('');
  const [schReason, setSchReason] = useState('');
  const [schYear, setSchYear] = useState('2025-2026');
  const [schSchool, setSchSchool] = useState('');
  const [schGrade, setSchGrade] = useState('');

  const resetForm = () => {
    setSchPerson(null);
    setSchType('hoc_bong');
    setSchAmount('');
    setSchReason('');
    setSchYear('2025-2026');
    setSchSchool('');
    setSchGrade('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSchAmount = parseInt(schAmount);
    if (
      !schPerson ||
      !schAmount ||
      isNaN(parsedSchAmount) ||
      parsedSchAmount <= 0
    ) {
      toast.error(tFund('toasts.fieldsRequired'));
      return;
    }
    try {
      const input: CreateScholarshipInput = {
        person_id: schPerson.id,
        type: schType,
        amount: parsedSchAmount,
        reason: schReason || undefined,
        academic_year: schYear,
        school: schSchool || undefined,
        grade_level: schGrade || undefined,
        status: 'pending',
      };
      await createSch.mutateAsync(input);
      toast.success(tFund('toasts.schSuccess'));
      setOpen(false);
      resetForm();
    } catch {
      toast.error(tFund('toasts.schError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('features.fund.nominateTitle')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('features.fund.nominateTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <PersonCombobox
              label={t('features.fund.personRequired')}
              selected={schPerson}
              onSelect={setSchPerson}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{tFund('form.type')}</Label>
              <Select
                value={schType}
                onValueChange={(v) => setSchType(v as ScholarshipType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUND_SCHOLARSHIP_TYPE_ORDER.map((type) => (
                    <SelectItem key={type} value={type}>
                      {tFund(`scholarshipTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{tFund('form.amountRequired')}</Label>
              <Input
                type="number"
                value={schAmount}
                onChange={(e) => setSchAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{tFund('form.year')}</Label>
              <Input
                value={schYear}
                onChange={(e) => setSchYear(e.target.value)}
                placeholder="2025-2026"
              />
            </div>
            <div>
              <Label>{tFund('form.gradeLevel')}</Label>
              <Input
                value={schGrade}
                onChange={(e) => setSchGrade(e.target.value)}
                placeholder={t('features.fund.placeholderClass')}
              />
            </div>
          </div>
          <div>
            <Label>{tFund('form.school')}</Label>
            <Input
              value={schSchool}
              onChange={(e) => setSchSchool(e.target.value)}
              placeholder={t('features.fund.placeholderSchool')}
            />
          </div>
          <div>
            <Label>{tFund('form.reason')}</Label>
            <Textarea
              value={schReason}
              onChange={(e) => setSchReason(e.target.value)}
              rows={2}
            />
          </div>
          <Button
            type="submit"
            disabled={createSch.isPending}
            className="w-full"
          >
            {createSch.isPending
              ? tCommon('saving')
              : t('features.fund.nominate')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
