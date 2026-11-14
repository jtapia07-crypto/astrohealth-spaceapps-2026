import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { recordsForProfile, type EmergencyInput } from '@/lib/emergency-history';

export function useEmergencyHistory(profileId: string) {
  const { emergencyRecords, addEmergencyRecord } = useStore();
  const records = useMemo(() => recordsForProfile(emergencyRecords, profileId), [emergencyRecords, profileId]);
  return {
    records,
    addRecord: (input: EmergencyInput) => addEmergencyRecord(profileId, input),
  };
}
