import { useEffect } from "react";
import { useAppState } from "@/lib/store";
import { syncRewardsFromAppState } from "./award-work";

/** Reconcile points for sprint days & income already completed (idempotent). */
export function useSyncWorkRewards() {
  const { state } = useAppState();

  useEffect(() => {
    syncRewardsFromAppState(state);
  }, [state.sprint?.startedAt, state.sprint?.completedDays.length, state.income.length]);
}
