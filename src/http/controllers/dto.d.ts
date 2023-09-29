/**
 * Parameters used in initiating a checkout session
 */
export interface InitiateCheckoutDTO {
  /**
   * amount to be paid, if provided, it creates a one time payment invoice
   */
  amount?: number;
  /**
   * stripe price id for payment. if provided, it creates a recurring subscription billed
   * accoreding to the stripe price frequency.
   * see https://stripe.com/docs/products-prices/overview
   */
  price_id?: string;
  /**
   * Customer ID that's native to the application
   */
  customer_id: string;
}

export interface StripeWebhook {
  id: string;
  object: "subscription" | "invoice";
  data: { customer: string; id: string };
  type: StripeEventType;
  [key: string]: any;
}

type StripeEventType =
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "invoice.finalization_failed";
