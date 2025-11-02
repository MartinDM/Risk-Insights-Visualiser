"use client";
import { TriangleAlert, User } from "lucide-react";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePeople } from "@/contexts/PeopleContext";
import type { Person, TransactionInsights } from "@/app/types/person";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

export default function RiskByIdPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { getPersonById } = usePeople();
  const person = getPersonById(id);

  useEffect(() => {
    if (!person) {
      // If the id is invalid, navigate back to the table
      router.push("../../");
    }
  }, [person, router]);

  if (!person) return null;

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <button
        onClick={() => router.back()}
        className="text-zinc-300 cursor-pointer hover:text-zinc-500 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6 border-l-amber-400 border-l-2 pl-4">
        Risk indicators for {person.name}
      </h1>

      <ScrollArea className="max-h-[75vh] pr-4">
        <PersonRiskCard person={person} />
      </ScrollArea>
    </div>
  );
}

function PersonRiskCard({ person }: { person: Person }) {
  const insights = person.transactionInsights;
  const { locationInsights } = person;

  const unusualLocations: NonNullable<
    TransactionInsights["riskIndicators"]
  >["unusualLocations"] =
    insights?.riskIndicators?.unusualLocations ?? [];
  const frequentMerchants = insights?.riskIndicators?.frequentMerchants ?? [];

  const avgStayDays = (() => {
    const history = locationInsights?.locationHistory ?? [];
    if (!history.length) return 0;
    const total = history.reduce((acc, loc) => acc + (loc.duration || 0), 0);
    return Math.round(total / history.length);
  })();

  return (
    <section className="rounded-md border border-border p-4">
      <header className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{person.name}</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium text-amber-400 mb-2 flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" /> Unusual Transactions
          </h3>
          {unusualLocations.length === 0 && (
            <p className="text-sm text-muted-foreground">None</p>
          )}
          <ul className="space-y-2">
            {unusualLocations.map((loc) => (
              <li key={`${loc.location}-${loc.date}`} className="rounded bg-muted/30 p-2">
                <div className="font-medium">{loc.location}</div>
                <div className="text-sm">${loc.amount}</div>
                <div className="text-sm">
                  {new Date(loc.date).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <strong>Risk:</strong> {loc.riskScore}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-md font-medium text-muted-foreground mb-2">
            Avg. Stay Duration across {locationInsights?.locationHistory?.length ?? 0} locations
          </h3>
          <p className="text-lg font-semibold">{avgStayDays} days</p>

          <div className="mt-4">
            <h4 className="text-md font-medium text-amber-400 mb-2">Frequent merchants</h4>
            {frequentMerchants.length === 0 && (
              <p className="text-sm text-muted-foreground">None</p>
            )}
            <ul className="space-y-2">
              {frequentMerchants.map((m) => (
                <li key={m.merchantName} className="rounded bg-muted/30 p-2">
                  <div className="font-medium">{m.merchantName}</div>
                  <div className="text-sm">${m.totalSpent}</div>
                  <div className="text-sm">
                    <strong>Transactions:</strong> {m.transactionCount}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}