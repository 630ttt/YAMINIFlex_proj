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
  const [paymentType, setPaymentType] = useState('cod');
  const [onlineProvider, setOnlineProvider] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!draft || !draft.designId) {
    return <div className="page-container empty-state">No order draft found. Please start from the Customize & Order page.</div>;
  }

  const draftTotal = Math.max(0, toFiniteNumber(draft?.grandTotal, toFiniteNumber(draft?.totalAmount, 0)));
  const quantity = Math.max(1, toFiniteNumber(draft?.quantity, 1));
  const basePrice = Math.max(0, toFiniteNumber(draft?.designBasePrice, 0));
  const amount = useMemo(() => Math.max(draftTotal, quantity * basePrice), [draftTotal, quantity, basePrice]);

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
      const safePaymentMethod = paymentType === 'online' ? onlineProvider : 'COD';
      const safePaymentStatus = paymentType === 'online' ? 'Paid' : 'Pending';

      formData.set('paymentMethod', safePaymentMethod);
      formData.set('paymentStatus', safePaymentStatus);
      formData.set('transactionId', paymentType === 'online' ? `TXN-${Date.now()}` : '');
      formData.set('amountPaid', String(validAmount));
      formData.set('totalAmount', String(validAmount));
      formData.set('grandTotal', String(validAmount));
      formData.set('paymentDate', new Date().toISOString().slice(0, 10));
      formData.set('paymentTime', new Date().toLocaleTimeString());
      formData.set('status', 'Order Placed');

      const res = await api.post('/orders', formData);
      sessionStorage.removeItem(ORDER_DRAFT_KEY);
      navigate(`/order-success/${res.data?._id || res.data?.orderId || ''}`);
    } catch (err) {
      setError(err.message || 'Unable to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container order-form-page">
      <h1 className="section-title">Choose Payment Method</h1>
      <div className="card wizard-card">
        {error && <p className="order-form-error">{error}</p>}
        <div className="payment-method-layout">
          <section className="payment-method-panel">
            <div className="payment-method-options">
              <label className="payment-option">
                <input type="radio" checked={paymentType === 'online'} onChange={() => setPaymentType('online')} />
                <span>Online Payment</span>
              </label>
              <label className="payment-option">
                <input type="radio" checked={paymentType === 'cod'} onChange={() => setPaymentType('cod')} />
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>

            {paymentType === 'online' && (
              <div className="online-gateways">
                <h3>Online Payment Options</h3>
                <div className="gateway-list">
                  {['PhonePe', 'UPI', 'Direct Bank Transfer'].map((provider) => (
                    <label className="gateway-row" key={provider}>
                      <input type="radio" name="gateway" checked={onlineProvider === provider.toLowerCase().replace(/\s/g, '-')} onChange={() => setOnlineProvider(provider.toLowerCase().replace(/\s/g, '-'))} />
                      <span>{provider}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {paymentType === 'cod' && (
              <div className="cod-payment">
                <h3>Cash on Delivery</h3>
                <p><strong>Final amount:</strong> ₹{amount}</p>
                <p>Payment status will remain <strong>Pending</strong> until cash is received.</p>
              </div>
            )}
          </section>

          <aside className="order-summary-panel">
            <h3>Order Summary</h3>
            <div className="summary-line"><span>Design</span><span>{draft.designTitle || draft.designId}</span></div>
            <div className="summary-line"><span>Size</span><span>{draft.size}</span></div>
            <div className="summary-line"><span>Quantity</span><span>{draft.quantity}</span></div>
            <div className="summary-line"><span>Material</span><span>{draft.material}</span></div>
            <div className="summary-line"><span>Grand Total</span><span>₹{amount}</span></div>
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
