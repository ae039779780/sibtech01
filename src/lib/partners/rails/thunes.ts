import { buildPayin, buildPayout, recall, SHARED_CORRIDORS } from "./stub-engine";
import type {
  PayinRequest,
  PayoutRequest,
  RailsPartner,
  TransferStatus,
} from "./types";

export class ThunesRailsPartner implements RailsPartner {
  readonly id = "thunes" as const;
  readonly displayName = "Thunes";
  readonly settlementModel =
    "Sibtech remains the Canadian-licensed principal; Thunes is the global pay-in/payout rail (local + cross-border). Wallet, ledger, KYC, and FX stay in Sibtech software.";

  async listCorridors() {
    return SHARED_CORRIDORS;
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
