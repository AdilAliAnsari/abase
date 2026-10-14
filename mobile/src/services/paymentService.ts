import api from './api';

export interface CreateOrderParams {
  amount: number; // in INR (e.g. 199)
  currency?: string; // 'INR'
  receipt?: string;
  notes?: Record<string, any>;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  id?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  message?: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyResponse {
  success: boolean;
  isVerified?: boolean;
  status?: string;
  message?: string;
}

export const paymentService = {
  /**
   * Create Razorpay payment order via backend
   */
  createOrder: async (params: CreateOrderParams): Promise<OrderResponse> => {
    return api.post<OrderResponse>('/api/payments/create-order', params);
  },

  /**
   * Verify signature of completed payment
   */
  verifyPayment: async (params: VerifyPaymentParams): Promise<VerifyResponse> => {
    return api.post<VerifyResponse>('/api/payments/verify', params);
  },

  /**
   * Check status of an order
   */
  getStatus: async (orderId: string): Promise<any> => {
    return api.get<any>(`/api/payments/${orderId}`);
  },
};

export default paymentService;
