import { setFeatureFlagAction, setRailsPartnerAction } from "@/app/actions/admin";
import { Button, DemoNote, PageHeader } from "@/components/ui";
import { capabilitiesFor } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { listRailsAdapters } from "@/lib/partners/rails";

const FLAG_KEYS = ["feature.cards", "feature.iban", "feature.crypto"] as const;

export default async function AdminSettingsPage() {
  const session = await requireStaff();
  const caps = capabilitiesFor(session.role);
  const settings = await prisma.setting.findMany();
  const current = settings.find((s) => s.key === "rails.partner");
  const flags = FLAG_KEYS.map((key) => ({
    key,
    value: settings.find((s) => s.key === key)?.value ?? "on",
  }));
  const adapters = listRailsAdapters();
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Partners, flags & license"
        description="Admin switches the DEMO rail adapter and feature flags. Sibtech remains the Canadian-licensed principal."
      />
      <DemoNote>Switching adapters never calls Thunes or Terra. Both are in-process stubs.</DemoNote>
      {caps.rails ? (
        <form action={setRailsPartnerAction} className="card hairline mt-6 space-y-4 p-6">
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
      ) : (
        <p className="mt-6 text-sm text-muted">
          Current adapter: {current?.value ?? "thunes"}. Only Admin can switch partners.
        </p>
      )}

      <div className="card hairline mt-6 p-6">
        <p className="font-medium">Feature flags</p>
        <p className="mt-1 text-sm text-muted">Admin-only. Surfaces stay DEMO even when on.</p>
        {caps.flags ? (
          <div className="mt-4 space-y-3">
            {flags.map((flag) => (
              <form key={flag.key} action={setFeatureFlagAction} className="flex flex-wrap items-center gap-3 text-sm">
                <input type="hidden" name="key" value={flag.key} />
                <span className="min-w-40 font-mono text-xs">{flag.key}</span>
                <select
                  name="value"
                  defaultValue={flag.value}
                  className="rounded-xl border border-line bg-navy-lift/40 px-3 py-2"
                >
                  <option value="on">on</option>
                  <option value="off">off</option>
                </select>
                <Button type="submit" variant="ghost">
                  Save
                </Button>
              </form>
            ))}
          </div>
        ) : (
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {flags.map((flag) => (
              <li key={flag.key}>
                {flag.key}: {flag.value}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card hairline mt-6 p-6 text-sm text-muted">
        License home: Canada · Cards/IBAN remain stub surfaces until partners are contracted.
      </div>
    </div>
  );
}
