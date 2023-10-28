import { currency } from "@/enums/currencyEnums/currencyEnums";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";

export default interface cashfreePaymentResponse {
  cf_order_id: number;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: string;
  payment_session_id: string;
  order_note: string;
  order_expiry_time: string;
  payments: {
    url: string;
  };
  refunds: {
    url: string;
  };
  settlements: {
    url: string;
  };
  terminal_data?: any;
  order_meta: {
    return_url: string;
    notify_url: string;
    payment_methods: null;
  };
}
export interface cashfreePaymentReturnInterface {
  result: cashfreePaymentResponse;
}

export default interface cashfreeDepositWebhookInterface {
  data: {
  order: {
    order_id: string;
    order_amount: number;
    order_currency: currency.INR;
    order_tags: any;
  };
  payment: {
    cf_payment_id: number;
    payment_status: string;
    payment_amount: number;
    payment_currency: currency.INR;
    payment_message: string;
    payment_time: string;
    bank_reference: number;
    auth_id: any;
    payment_method: {
      upi: {
        channel: any;
        upi_id: string;
      };
    };
    payment_group: string;
  };
  customer_details: {
    customer_name: string;
    customer_id: string;
    customer_email: string;
    customer_phone: string;
  };
  payment_gateway_details: {
    gateway_name: string;
    gateway_order_id: number;
    gateway_payment_id: number;
    gateway_status_code: any;
  };
  payment_offers: [
    {
      offer_id: string;
      offer_type: string;
      offer_meta: {
        offer_title: string;
        offer_description: string;
        offer_code: string;
        offer_start_time: string;
        offer_end_time: string;
      };
      offer_redemption: {
        redemption_status: string;
        discount_amount: number;
        cashback_amount: number;
      };
    },
  ];
  event_time: string;
  type: string;
  }
}

export default interface CashfreePayoutWebhook {
  event: paymentStatusEnum;
  transferId: string;
  referenceId: string;
  acknowledged: number;
  eventTime: string;
  utr: string | number;
  signature: string;
}