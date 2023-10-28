export default interface cashfreePaymentPayload {
  customer_details: {
    customer_id: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta: {
    return_url: string;
    notify_url: string;
  };
  order_id: string;
  order_amount: number;
  order_currency: string;
  appId: string;
  secretKey: string;
}
