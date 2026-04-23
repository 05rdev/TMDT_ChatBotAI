
export const MAP_ORDER_STATUS: Record<string, string> = {
  'PENDING': 'Chờ duyệt',
  'PROCESSING': 'Đang gói',
  'SHIPPED': 'Đang giao hàng',
  'DELIVERED': 'Hoàn tất',
  'CANCELLED': 'Đã hủy',
};

export const MAP_PAYMENT_STATUS: Record<string, string> = {
  'PENDING': 'Chờ thanh toán',
  'SUCCESS': 'Thành công',
  'FAILED': 'Thất bại',
  'REFUNDED': 'Đã hoàn tiền',
};

export const translateOrderStatus = (status: string): string => {
  return MAP_ORDER_STATUS[status] || status;
};

export const translatePaymentStatus = (status: string): string => {
  return MAP_PAYMENT_STATUS[status] || status;
};
