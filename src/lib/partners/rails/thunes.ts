import { buildPayin, buildPayout, recall, PAYOUT_CORRIDORS } from "./stub-engine";
import type {
  PayinRequest,
  PayoutRequest,
  RailsPartner,
  TransferStatus,
} from "./types";

export class ThunesRailsPartner implements RailsPartner {
  readonly id = "thunes" as const;
  readonly displayName = "Thunes (DEMO stub)";
  readonly settlementModel =
    "DEMO — no live vendor calls. Payout picker is Bank, Push2card, and UPI. Push2card prefers this Thunes stub. Never a live vendor session.";

  async listCorridors() {
    return PAYOUT_CORRIDORS;
  }

  async createPayin(request: PayinRequest) {
    return buildPayin(this.id, "THN", "Thunes Settlement Bank (sandbox)", request);
  }

  async createPayout(request: PayoutRequest) {
    return buildPayout(this.id, "THN", request);
  }

  async getTransfer(partnerRef: string): Promise<TransferStatus> {
    return recall(partnerRef);
  }
}
