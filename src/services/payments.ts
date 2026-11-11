import type { PaymentMethodId } from '../config/business';

/**
 * Payment seam. Nothing is connected: no gateway SDK is loaded and no card,
 * UPI or bank data is collected. A real integration (Razorpay, Cashfree, PayU…)
 * implements `PaymentGateway.initiate` and returns a redirect / intent handle.
 */
export interface PaymentRequest {
  amount: number;
  method: PaymentMethodId;
  orderDraftId: string;
}

export class PaymentNotConnectedError extends Error {
  constructor() {
    super('Payment gateway is not connected in this preview.');
  }
}

export interface PaymentGateway {
  initiate(req: PaymentRequest): Promise<never>;
}

export const paymentGateway: PaymentGateway = {
  initiate: async () => {
    throw new PaymentNotConnectedError();
  },
};
