import { JuspayOrderStatusResponse } from "../juspayOrderStatusResponse/juspayOrderStatusResponse";

export interface juspayWebhook {
  id: string;
  date_created: string;
  event_name: string;
  content: {
    order: JuspayOrderStatusResponse;
  };
}
