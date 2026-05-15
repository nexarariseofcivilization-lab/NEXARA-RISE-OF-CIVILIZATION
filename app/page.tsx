'use client';

import { useAppStore } from '@/lib/store';
import { determinePlayerTruthLayer, TruthLayer } from '@/lib/adapters/TruthLayer';
import CommandCenter from '@/components/CommandCenter';
import CivilianDashboard from '@/components/CivilianDashboard';

export default function EntryPoint() {
  const player = useAppStore(state => state.player);
  
  // Phase 46: Human-Scale Entry Architecture
  // Determine clearance layer based on character state
  const truthLayer = determinePlayerTruthLayer(player);

  // If the player is high level enough, they can see the full system
  if (truthLayer >= TruthLayer.ELITE) {
      return <CommandCenter />;
  }

  return <CivilianDashboard truthLayer={truthLayer} />;
}
