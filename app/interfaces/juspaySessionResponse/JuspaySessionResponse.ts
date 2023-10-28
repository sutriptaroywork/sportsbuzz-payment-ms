export interface JuspaySessionResponse {
  status: string,
  id: string,
  order_id: string,
  payment_links: {
      web: string,
      expiry: any
  },
  sdk_payload: {
      requestId: string,
      service: string,
      payload: {
          clientId: string,
          amount: string,
          merchantId: string,
          clientAuthToken: string,
          clientAuthTokenExpiry: string,
          environment: string,
          "options.getUpiDeepLinks"?: string,
          lastName?: string,
          action: string,
          customerId: string,
          returnUrl: string,
          currency: string,
          firstName?: string,
          customerPhone: string,
          customerEmail: string,
          orderId: string,
          description: string,
          udf1? : string
      }
  }
}