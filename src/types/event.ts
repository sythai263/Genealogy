export type EventType = 'gio' | 'hop_ho' | 'le_tet' | 'other';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date?: string;
  event_lunar?: string;
  event_type: EventType;
  person_id?: string;
  location?: string;
  recurring: boolean;
  created_at: string;
}
