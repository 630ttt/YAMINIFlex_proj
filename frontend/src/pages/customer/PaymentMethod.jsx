import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Loader from '../../components/Loader';
import './OrderForm.css';

const ORDER_DRAFT_KEY = 'yaminiflex_order_draft';

const readDraft = () => {
  try {
    const raw = sessionStorage.getItem(ORDER_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const toFiniteNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const PaymentMethod = () => {
  const navigate = useNavigate();
  const draft = readDraft();
  const [paymentType, setPaymentType] = useState('online');
  const [onlineProvider, setOnlineProvider] = useState('PhonePe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);

  if (!draft || !draft.designId) {
    return <div className="page-container empty-state">No order draft found. Please start from the Customize & Order page.</div>;
  }

  const draftTotal = Math.max(0, toFiniteNumber(draft?.grandTotal, toFiniteNumber(draft?.totalAmount, 0)));
  const quantity = Math.max(1, toFiniteNumber(draft?.quantity, 1));
  const basePrice = Math.max(0, toFiniteNumber(draft?.designBasePrice, 0));
  const amount = useMemo(() => Math.max(draftTotal, quantity * basePrice), [draftTotal, quantity, basePrice]);

  const merchantUpi = import.meta.env.VITE_UPI_ID || 'yamini.flex@upi';
  const orderRef = `YF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.round(Date.now() % 100000)}`;

  const openPaymentDeepLink = (provider = onlineProvider) => {
    if (!provider || provider === 'Direct Bank Transfer') {
      return;
    }

    const safeAmount = Math.round(Math.max(0, amount));
    const appScheme = provider === 'PhonePe' ? 'phonepe://upi/pay' : 'upi://pay';
    const payUrl = `${appScheme}?pa=${encodeURIComponent(merchantUpi)}&pn=${encodeURIComponent('YAMINI FLEX')}&am=${safeAmount}&cu=INR&tn=${encodeURIComponent(orderRef)}`;

    try {
      window.location.href = payUrl;
    } catch {
      window.open(payUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const buildFiles = () => {
    const files = [];
    if (draft.mainSubjectPhotoData) {
      files.push(dataUrlToFile(draft.mainSubjectPhotoData, draft.mainPhotoName || 'main-subject-photo'));
    }
    if (Array.isArray(draft.additionalFilesData)) {
      draft.additionalFilesData.forEach((data, index) => {
        if (!data) return;
        const file = dataUrlToFile(data, draft.additionalFilesNames?.[index] || `additional-photo-${index + 1}`);
        if (file) files.push(file);
      });
    }
    return files;
  };

  const handleConfirm = async () => {
    if (!draft || !draft.designId) {
      setError('No draft was found. Please start again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      const cleanDraft = { ...draft };
      delete cleanDraft.mainSubjectPhotoData;
      delete cleanDraft.additionalFilesData;
      delete cleanDraft.additionalFilesNames;
      delete cleanDraft.mainPhotoName;

      Object.entries(cleanDraft).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, String(item)));
        } else {
          formData.append(key, String(value));
        }
      });

      const files = buildFiles();
      files.forEach((file) => formData.append('customerFiles', file));

      const validAmount = Math.round(Math.max(0, amount));

      if (paymentType === 'cod') {
        formData.set('paymentMethod', 'COD');
        formData.set('paymentStatus', 'COD / Pending');
        formData.set('transactionId', '');
        formData.set('amountPaid', '0');
        formData.set('totalAmount', String(validAmount));
        formData.set('grandTotal', String(validAmount));
        formData.set('paymentDate', new Date().toISOString().slice(0, 10));
        formData.set('paymentTime', new Date().toLocaleTimeString());
        formData.set('status', 'Order Placed');

        const res = await api.post('/orders', formData);
        sessionStorage.removeItem(ORDER_DRAFT_KEY);
        navigate(`/order-success/${res.data?._id || res.data?.orderId || ''}`);
        return;
      }

      if (!onlineProvider) {
        setError('Please choose one online payment method.');
        return;
      }

      if (!pendingOrder) {
        formData.set('paymentMethod', onlineProvider);
        formData.set('paymentStatus', 'Pending');
        formData.set('transactionId', `TXN-${Date.now()}`);
        formData.set('amountPaid', '0');
        formData.set('totalAmount', String(validAmount));
        formData.set('grandTotal', String(validAmount));
        formData.set('paymentDate', new Date().toISOString().slice(0, 10));
        formData.set('paymentTime', new Date().toLocaleTimeString());
        formData.set('status', 'Order Placed');

        const res = await api.post('/orders', formData);
        const order = res.data?.data || res.data;
        setPendingOrder(order);
        setStatus('Payment started. Complete the selected online payment and then verify the payment.');
        openPaymentDeepLink(onlineProvider);
        return;
      }

      const verifyPayload = {
        paymentVerified: true,
        provider: onlineProvider,
        transactionId: pendingOrder.transactionId || pendingOrder?.data?.transactionId || `TXN-${Date.now()}`,
        amount: validAmount,
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentTime: new Date().toLocaleTimeString(),
      };

      const verifyRes = await api.post(`/orders/${pendingOrder._id || pendingOrder.id}/verify-payment`, verifyPayload);
      sessionStorage.removeItem(ORDER_DRAFT_KEY);
      navigate(`/order-success/${verifyRes.data?._id || verifyRes.data?.order?._id || pendingOrder._id || pendingOrder.id || ''}`);
    } catch (err) {
      setError(err.message || 'Unable to place order.');
      setStatus('Payment failed or cancelled. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container order-form-page payment-method-page">
      <div className="payment-method-frame">
        <div className="payment-method-head">
          <div>
            <h1 className="section-title">Choose Payment Method</h1>
          </div>
          <span className="secure-badge">Secure Checkout</span>
        </div>

        <div className="payment-method-tabs">
          <label className="payment-option">
            <input type="radio" checked={paymentType === 'online'} onChange={() => setPaymentType('online')} />
            <span className="payment-tab-title">Online Payment</span>
          </label>
          <label className="payment-option">
            <input type="radio" checked={paymentType === 'cod'} onChange={() => setPaymentType('cod')} />
            <span className="payment-tab-title">Cash on Delivery (COD)</span>
          </label>
        </div>

        <div className="payment-grid">
          <section className="payment-method-panel">
            {paymentType === 'online' && (
              <div className="online-gateways">
                <div className="gateway-heading">
                  <h3>Online Payment Options</h3>
                </div>

                <div className="gateway-list">
                  {['PhonePe', 'UPI', 'Direct Bank Transfer'].map((provider) => (
                    <label className="gateway-row" key={provider}>
                      <input type="radio" name="gateway" checked={onlineProvider === provider} onChange={() => {
                        setOnlineProvider(provider);
                        setError('');
                        if (provider !== 'Direct Bank Transfer') {
                          openPaymentDeepLink(provider);
                        }
                      }} />
                      <span>{provider}</span>
                    </label>
                  ))}
                </div>

                {onlineProvider === 'PhonePe' && (
                  <div className="phonepe-scan-card">
                    <div className="phonepe-scan-top">
                      <span className="phonepe-brand">PhonePe</span>
                      <span className="phonepe-status">UPI Scanner</span>
                    </div>

                    <div className="phonepe-scan-body">
                      <div className="phonepe-qr-wrap">
                        <div className="phonepe-qr">
                          <span className="qr-corner corner-tl" />
                          <span className="qr-corner corner-tr" />
                          <span className="qr-corner corner-bl" />
                          <span className="qr-corner corner-br" />
                          <span className="qr-center">₹{amount}</span>
                        </div>
                      </div>

                      <div className="phonepe-scan-details">
                        <div className="scan-detail-row">
                          <span className="scan-label">Paying Amount</span>
                          <span className="scan-value">₹{amount}</span>
                        </div>
                        <div className="scan-detail-row">
                          <span className="scan-label">Merchant</span>
                          <span className="scan-value">YAMINI FLEX PRINTING</span>
                        </div>
                        <div className="scan-detail-row">
                          <span className="scan-label">UPI ID</span>
                          <span className="scan-value">{merchantUpi}</span>
                        </div>
                        <div className="scan-detail-row">
                          <span className="scan-label">Reference</span>
                          <span className="scan-value">{orderRef}</span>
                        </div>
                      </div>
                    </div>

                    <div className="phonepe-scan-actions">
                      <button type="button" className="btn btn-primary scan-button" onClick={() => openPaymentDeepLink('PhonePe')}>Open PhonePe App</button>
                    </div>
                    <p className="scan-helper">Scan the QR or open the PhonePe app to complete the payment.</p>
                  </div>
                )}

                {onlineProvider === 'UPI' && (
                  <div className="upi-scan-card">
                    <div className="upi-card-title">
                      <span className="upi-heading">UPI Payment</span>
                    </div>
                    <div className="upi-payment-table">
                      <div className="upi-payment-row">
                        <span className="upi-label">UPI ID</span>
                        <span className="upi-value">{merchantUpi}</span>
                      </div>
                      <div className="upi-payment-row">
                        <span className="upi-label">Amount</span>
                        <span className="upi-value">₹{amount}</span>
                      </div>
                      <div className="upi-payment-row">
                        <span className="upi-label">Reference</span>
                        <span className="upi-value">{orderRef}</span>
                      </div>
                    </div>
                    <div className="phonepe-scan-actions">
                      <button type="button" className="btn btn-primary scan-button" onClick={() => openPaymentDeepLink('UPI')}>Pay with UPI</button>
                    </div>
                  </div>
                )}

                {onlineProvider === 'Direct Bank Transfer' && (
                  <div className="bank-transfer-info">
                    <div className="bank-transfer-title">
                      <strong>Direct Bank Transfer</strong>
                    </div>
                    <div className="bank-transfer-grid">
                      <div className="bank-transfer-row"><span>Account Name</span><span>YAMINI FLEX PRINTING</span></div>
                      <div className="bank-transfer-row"><span>Bank</span><span>State Bank of India</span></div>
                      <div className="bank-transfer-row"><span>Branch</span><span>Main Branch</span></div>
                      <div className="bank-transfer-row"><span>Account No.</span><span>000000000000</span></div>
                      <div className="bank-transfer-row"><span>IFSC</span><span>SBIN0000000</span></div>
                      <div className="bank-transfer-row"><span>Amount</span><span>₹{amount}</span></div>
                    </div>
                    <p className="scan-helper">Transfer the exact amount and share the transaction reference for verification.</p>
                  </div>
                )}
              </div>
            )}

            {paymentType === 'cod' && (
              <div className="cod-payment">
                <h3>Cash on Delivery</h3>
                <div className="cod-payment-body">
                  <p><strong>Final amount:</strong> ₹{amount}</p>
                  <p>Payment status will remain <strong>Pending</strong> until cash is received.</p>
                </div>
              </div>
            )}
          </section>

          <aside className="order-summary-panel">
            <h3>Order Summary</h3>
            <div className="summary-line"><span>Design</span><span>{draft.designTitle || draft.designId}</span></div>
            <div className="summary-line"><span>Size</span><span>{draft.size}</span></div>
            <div className="summary-line"><span>Quantity</span><span>{draft.quantity}</span></div>
            <div className="summary-line"><span>Material</span><span>{draft.material}</span></div>
            <div className="summary-line total-line"><span>Grand Total</span><span>₹{amount}</span></div>
            {error && <p className="order-form-error">{error}</p>}
            {status && <p className="order-status-message">{status}</p>}
            <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
              {loading ? <Loader label="" /> : 'Confirm Payment & Place Order'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

function dataUrlToFile(dataUrl, fileName) {
  if (!dataUrl) return null;
  const [meta, data] = dataUrl.split(',');
  const mime = meta?.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], fileName, { type: mime });
}

export default PaymentMethod;
