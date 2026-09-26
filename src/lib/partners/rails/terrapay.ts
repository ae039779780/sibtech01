import { buildPayin, buildPayout, recall, PAYOUT_CORRIDORS } from "./stub-engine";
import type {
  PayinRequest,
  PayoutRequest,
  RailsPartner,
  TransferStatus,
} from "./types";

export class TerraPayRailsPartner implements RailsPartner {
  readonly id = "terrapay" as const;
  readonly displayName = "TerraPay / Terra Rail (DEMO stub)";
  readonly settlementModel =
    "DEMO — no live vendor calls. Same three payout methods (Bank, Push2card, UPI). Push2card still hints Thunes — not a fourth proprietary rail.";

  async listCorridors() {
    return PAYOUT_CORRIDORS;
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
