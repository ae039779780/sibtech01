import { TerraPayRailsPartner } from "./terrapay";
import { ThunesRailsPartner } from "./thunes";
import type { RailsPartner, RailsProviderId } from "./types";

export type { RailsPartner, RailsProviderId } from "./types";
export { ThunesRailsPartner } from "./thunes";
export { TerraPayRailsPartner } from "./terrapay";

const adapters: Record<RailsProviderId, () => RailsPartner> = {
  thunes: () => new ThunesRailsPartner(),
  terrapay: () => new TerraPayRailsPartner(),
};

export function parseRailsProvider(value?: string | null): RailsProviderId {
  if (value === "terrapay" || value === "terra" || value === "terra-rail") {
    return "terrapay";
  }
  return "thunes";
}

export function getRailsPartner(id?: string | null): RailsPartner {
  const key = parseRailsProvider(id ?? process.env.RAILS_PARTNER);
  return adapters[key]();
}

export async function getConfiguredRailsPartner(): Promise<RailsPartner> {
  try {
    const { activeRailsPartnerId } = await import("@/lib/config");
    return getRailsPartner(await activeRailsPartnerId());
  } catch {
    return getRailsPartner();
  }
}

export function listRailsAdapters(): RailsPartner[] {
  return Object.keys(adapters).map((id) => adapters[id as RailsProviderId]());
}
