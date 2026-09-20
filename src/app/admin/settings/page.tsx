import { setRailsPartnerAction } from "@/app/actions/admin";
import { Button, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { listRailsAdapters } from "@/lib/partners/rails";

export default async function AdminSettingsPage() {
  const current = await prisma.setting.findUnique({ where: { key: "rails.partner" } });
  const adapters = listRailsAdapters();
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Partners & license"
        description="Sibtech holds the Canadian financial license. Choose which global rail adapter the demo uses. Do not hardcode a single vendor."
      />
      <form action={setRailsPartnerAction} className="card hairline space-y-4 p-6">
        <p className="text-sm text-muted">
          Current adapter: <span className="text-ink">{current?.value ?? "thunes"}</span>
        </p>
        {adapters.map((a) => (
          <label key={a.id} className="flex items-start gap-3 text-sm">
            <input type="radio" name="partner" value={a.id} defaultChecked={a.id === (current?.value ?? "thunes")} />
            <span>
              <span className="font-medium">{a.displayName}</span>
              <span className="mt-1 block text-muted">{a.settlementModel}</span>
            </span>
          </label>
        ))}
        <Button type="submit">Save rail adapter</Button>
      </form>
      <div className="card hairline mt-6 p-6 text-sm text-muted">
        License home: Canada · Feature flags for cards/IBAN remain stub surfaces until partners are contracted.
      </div>
    </div>
  );
}
