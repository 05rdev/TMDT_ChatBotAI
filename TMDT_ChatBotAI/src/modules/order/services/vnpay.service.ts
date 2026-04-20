import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';

export class VNPayService {
  /**
   * Tạo URL thanh toán VNPay
   */
  static createPaymentUrl(
    ipAddr: string,
    amount: number,
    orderId: string,
    orderInfo: string,
    bankCode?: string
  ): string {
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      throw new Error('VNPAY configuration is missing');
    }

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const expiredDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

    let vnp_Params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expiredDate,
    };

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    return vnpUrl;
  }

  /**
   * Xác thực URL trả về từ VNPay (IPN hoặc Return URL)
   */
  static verifyReturnUrl(vnp_Params: any): boolean {
    const secretKey = process.env.VNP_HASH_SECRET;
    if (!secretKey) return false;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
  }

  private static sortObject(obj: any) {
    const sorted: any = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
