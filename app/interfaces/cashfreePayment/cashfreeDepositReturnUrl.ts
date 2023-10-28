export default interface cashfreeReturnUrlWebhook {
  cf_link_id?: number;
  order_id?: string;
  link_id: string;
  link_status: string;
  link_currency: string;
  link_amount: string;
  link_amount_paid: string;
  link_partial_payments: boolean;
  link_minimum_partial_amount: string;
  link_purpose: string;
  link_created_at: string;
  customer_details: {
    customer_phone: string;
    customer_email: string;
    customer_name: string;
  };
  link_meta: {
    notify_url: string;
  };
  link_url: string;
  link_expiry_time: string;
  link_notes: {
    note_key_1: string;
  };
  link_auto_reminders: boolean;
  link_notify: {
    send_sms: boolean;
    send_email: boolean;
  };
  order: {
    order_amount: string;
    order_id: string;
    order_expiry_time: string;
    order_hash: string;
    transaction_id: number;
    transaction_status: string;
  };
  type: string;
  version: number;
  event_time: string;
}
