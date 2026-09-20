import { buildPayin, buildPayout, recall, SHARED_CORRIDORS } from "./stub-engine";
import type {
  PayinRequest,
  PayoutRequest,
  RailsPartner,
  TransferStatus,
} from "./types";

export class TerraPayRailsPartner implements RailsPartner {
  readonly id = "terrapay" as const;
  readonly displayName = "TerraPay / Terra Rail";
  readonly settlementModel =
    "Sibtech remains the Canadian-licensed principal; TerraPay / Terra Rail is the alternative global corridor network. Same Sibtech ledger and UX; only the rail adapter changes.";

  async listCorridors() {
    return SHARED_CORRIDORS;
  }

  async createPayin(request: PayinRequest) {
    return buildPayin(this.id, "TRP", "Terra Rail Correspondent (sandbox)", request);
  }

  async createPayout(request: PayoutRequest) {
    return buildPayout(this.id, "TRP", request);
  }

  async getTransfer(partnerRef: string): Promise<TransferStatus> {
    return recall(partnerRef);
  }
}
