import { DataTypes } from "sequelize";
import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";

export interface JuspayOrderStatusResponse {
    customer_email: string,
    customer_phone: string,
    customer_id: string,
    status_id: number,
    status: string,
    id: string,
    merchant_id: string,
    amount: number,
    currency: string,
    order_id: string,
    date_created: string,
    return_url: string,
    product_id: string,
    payment_links: {
        iframe: string,
        web: string,
        mobile: string
    },
    udf1?: string,
    udf2?: string,
    udf3?: string,
    udf4?: string,
    udf5?: string,
    udf6?: string,
    udf7?: string,
    udf8?: string,
    udf9?: string,
    udf10?: string,
    txn_id: string,
    payment_method_type: string,
    auth_type: string,
    payment_method: string,
    refunded: boolean,
    refunds? : refundsCard[] | refundsWallet[] | any;
    amount_refunded: number,
    effective_amount?: number,
    resp_code: any,
    resp_message: string,
    bank_error_code: string,
    bank_error_message: string,
    txn_uuid: string,
    txn_detail: {
        txn_id: string,
        order_id: string,
        status: string,
        error_code: any,
        net_amount: number,
        surcharge_amount: number,
        tax_amount: number,
        txn_amount: number,
        offer_deduction_amount: number,
        gateway_id: number,
        currency: string,
        express_checkout: boolean,
        redirect: boolean,
        txn_uuid: string,
        gateway: string,
        error_message: string,
        created: string
    },
    card?: card,
    payment_gateway_response: {
        resp_code: string,
        rrn: number,
        created: string,
        epg_txn_id: string,
        resp_message: string,
        auth_id_code: string,
        txn_id: string
    },
    gateway_id: number,
    payer_vpa?: string,
    upi?: upiInterface,
    gateway_reference_id: string,
    metadata? : {
        "RAZORPAY:gateway_reference_id": string
    },
    offers: any
}

export interface upiInterface {
 payer_vpa: string,
 txn_flow_type: string   
}

export interface refundsCard {
            id: string,
            amount: number,
            unique_request_id: string,
            ref: string,
            created: string,
            status: string,
            error_message: string,
            sent_to_gateway: boolean,
            initiated_by: string,
            refund_source: string,
            refund_type: string,
            metadata: {
                speed_processed?: string, // only for Razorpay successful refunds
                speed_requested?: string // only for Razorpay successful refunds
            },
           pg_processed_at: string,
           error_code: string
        
}

export interface refundsWallet {
    unique_request_id: string,
    status: string,
    sent_to_gateway: boolean,
    ref: string,
    initiated_by: string,
    id: string,
    error_message: string,
    created: string,
    arn: string,
    amount: number
}

    export interface card {
        expiry_year: string,
        card_reference: string,
        saved_to_locker: boolean,
        expiry_month: string,
        name_on_card: string,
        card_issuer: string,
        last_four_digits: string,
        using_saved_card: boolean,
        card_fingerprint: string,
        card_isin: string,
        card_type: string,
        card_brand: string,
        using_token: boolean
    }

    export interface orderStatusResponse extends defaultResponseInterface {
        data: {
          id: DataTypes.IntegerDataType,
          iOrderId: string,
          ePaymentGateway: string,
          ePaymentStatus: string
        }
    }