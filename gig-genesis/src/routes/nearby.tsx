import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { EventDiscoveryHub } from "@/components/events/EventDiscoveryHub";

export const Route = createFileRoute("/nearby")({
  head: () => ({
    meta: [
      { title: "Live Events & Hackathons — EARNGEN-AI" },
      {
        name: "description",
        content:
          "Real-time hackathons, startup events, internships, and meetups near you — powered by Devfolio, Unstop, and AI matching.",
      },
    ],
  }),
  component: NearbyPage,
});

function NearbyPage() {
  return (
    <Shell>
      <RequireAuth>
        <EventDiscoveryHub />
      </RequireAuth>
    </Shell>
  );
}
