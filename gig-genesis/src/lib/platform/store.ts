import { useEffect, useState } from "react";
import { awardNdaSigned, awardExchangeComplete } from "./award-work";
import { readPlatform, writePlatform, subscribePlatform } from "./platform-storage";
import type { PlatformState, SkillExchange } from "./types";

export { readPlatform, writePlatform } from "./platform-storage";

function read(): PlatformState {
  return readPlatform();
}

function write(s: PlatformState) {
  writePlatform(s);
}

export function usePlatformState() {
  const [state, setState] = useState<PlatformState>(() => read());

  useEffect(() => {
    const unsub = subscribePlatform(() => setState(read()));
    setState(read());
    return unsub;
  }, []);

  return {
    state,
    postExchange(offered: string, wanted: string) {
      const next = read();
      const entry: SkillExchange = {
        id: crypto.randomUUID(),
        offeredSkill: offered,
        wantedSkill: wanted,
        status: "open",
        xpReward: 0,
        createdAt: new Date().toISOString(),
      };
      next.exchanges = [entry, ...next.exchanges];
      write(next);
    },
    completeExchange(exchangeId: string) {
      const next = read();
      const ex = next.exchanges.find((e) => e.id === exchangeId);
      if (!ex || ex.status === "completed") return;
      ex.status = "completed";
      write(next);
      awardExchangeComplete(exchangeId, ex.offeredSkill, ex.wantedSkill);
    },
    setLocationSharing(on: boolean) {
      const next = read();
      next.locationSharing = on;
      write(next);
    },
    setNearbyRadius(km: number) {
      const next = read();
      next.nearbyRadiusKm = km;
      write(next);
    },
    redeemReward(rewardId: string, title: string, pointsCost: number) {
      const next = read();
      if (next.rewardPoints < pointsCost) return false;
      next.rewardPoints -= pointsCost;
      next.redemptions = [
        {
          id: crypto.randomUUID(),
          rewardId,
          title,
          pointsSpent: pointsCost,
          createdAt: new Date().toISOString(),
        },
        ...next.redemptions,
      ];
      write(next);
      return true;
    },
    createNda(projectTitle: string) {
      const next = read();
      next.ndas = [
        {
          id: crypto.randomUUID(),
          projectTitle,
          counterparty: "Awaiting counterparty",
          status: "pending_signature",
          trustScoreDelta: 0,
          createdAt: new Date().toISOString(),
        },
        ...next.ndas,
      ];
      write(next);
    },
    signNda(ndaId: string) {
      const next = read();
      const nda = next.ndas.find((n) => n.id === ndaId);
      if (!nda || nda.status === "signed") return;
      nda.status = "signed";
      nda.signedAt = new Date().toISOString();
      nda.trustScoreDelta = 5;
      write(next);
      awardNdaSigned(ndaId, nda.projectTitle);
    },
  };
}

export { BADGES } from "./mock-data";
