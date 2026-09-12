const Order = require('../models/Order');

const {
  createPhonePePayment,
  getPhonePeOrderStatus,
} = require('../services/phonepeService');

const {
  sendPaymentSuccessEmail,
} = require('../services/emailService');

const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

/**
 * POST /api/payments/phonepe/create
 *
 * Creates a PhonePe payment for an existing Yamini Flex order.
 */
const createPhonePeOrder = async (req, res) => {
  try {
    const { orderId } = req.body || {};

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentMethod !== 'PhonePe') {
      return res.status(400).json({
        success: false,
        message:
          'This order is not configured for PhonePe payment',
      });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid',
      });
    }

    const orderAmount = toFiniteNumber(
      order.grandTotal,
      toFiniteNumber(order.totalAmount, 0)
    );

    if (orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount',
      });
    }

    // Convert ₹ to paise
    const amountInPaise = Math.round(
      orderAmount * 100
    );

    let merchantOrderId =
      order.phonePeOrderId;

    if (!merchantOrderId) {
      merchantOrderId =
        `YF-${order.orderId}-${Date.now()}`;
    }

    /*
     * PhonePe redirects the customer to the BACKEND
     * after payment.
     *
     * Backend verifies the payment and then redirects
     * the customer to Home.
     */
    const backendUrl =
      process.env.BACKEND_PUBLIC_URL ||
      'http://localhost:5000';

    const redirectUrl =
      `${backendUrl}/api/payments/phonepe/return` +
      `?orderId=${encodeURIComponent(
        order._id.toString()
      )}` +
      `&merchantOrderId=${encodeURIComponent(
        merchantOrderId
      )}`;

    console.log(
      'Creating PhonePe payment:',
      {
        orderId: order._id.toString(),
        merchantOrderId,
        amountInPaise,
        redirectUrl,
      }
    );

    const phonePeResponse =
      await createPhonePePayment({
        merchantOrderId,
        amount: amountInPaise,
        redirectUrl,
      });

    if (!phonePeResponse?.redirectUrl) {
      return res.status(500).json({
        success: false,
        message:
          'PhonePe did not return a checkout URL',
      });
    }

    order.phonePeOrderId =
      merchantOrderId;

    order.paymentStatus =
      'Pending';

    order.paymentMethod =
      'PhonePe';

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        'PhonePe payment created',
      data: {
        orderId: order._id,
        merchantOrderId,
        redirectUrl:
          phonePeResponse.redirectUrl,
      },
    });
  } catch (error) {
    console.error(
      'PhonePe create payment error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to create PhonePe payment',
    });
  }
};

/**
 * GET /api/payments/phonepe/return
 *
 * PhonePe sends the customer here after checkout.
 *
 * Backend verifies the payment directly with PhonePe.
 * If successful, customer is redirected directly to Home.
 */
const handlePhonePeReturn = async (
  req,
  res
) => {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    'http://localhost:5173';

  try {
    const {
      orderId,
      merchantOrderId,
    } = req.query;

    console.log(
      'PhonePe return received:',
      {
        orderId,
        merchantOrderId,
      }
    );

    if (!orderId || !merchantOrderId) {
      console.error(
        'PhonePe return missing orderId or merchantOrderId'
      );

      return res.redirect(
        `${frontendUrl}/`
      );
    }

    const order =
      await Order.findById(orderId);

    if (!order) {
      console.error(
        'Order not found:',
        orderId
      );

      return res.redirect(
        `${frontendUrl}/`
      );
    }

    /*
     * Make sure the PhonePe order belongs
     * to this Yamini order.
     */
    if (
      !order.phonePeOrderId ||
      order.phonePeOrderId !==
        merchantOrderId
    ) {
      console.error(
        'PhonePe merchant order mismatch:',
        {
          stored:
            order.phonePeOrderId,
          received:
            merchantOrderId,
        }
      );

      return res.redirect(
        `${frontendUrl}/`
      );
    }

    /*
     * Already paid.
     *
     * This also prevents the payment success
     * email from being sent twice if PhonePe
     * redirects/calls this URL again.
     */
    if (
      order.paymentStatus === 'Paid'
    ) {
      return res.redirect(
        `${frontendUrl}/`
      );
    }

    /*
     * Ask PhonePe for the real payment status.
     */
    let statusResponse = null;

    for (
      let attempt = 1;
      attempt <= 3;
      attempt++
    ) {
      try {
        statusResponse =
          await getPhonePeOrderStatus(
            merchantOrderId
          );

        console.log(
          `PhonePe status attempt ${attempt}:`,
          JSON.stringify(
            statusResponse,
            null,
            2
          )
        );

        const state =
          String(
            statusResponse?.state ||
              statusResponse?.data?.state ||
              ''
          ).toUpperCase();

        if (
          state === 'COMPLETED' ||
          state === 'FAILED' ||
          state === 'FAILURE' ||
          state === 'CANCELLED'
        ) {
          break;
        }
      } catch (error) {
        console.error(
          `PhonePe status attempt ${attempt} failed:`,
          error.message
        );
      }

      if (attempt < 3) {
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 2000)
        );
      }
    }

    const state =
      String(
        statusResponse?.state ||
          statusResponse?.data?.state ||
          ''
      ).toUpperCase();

    console.log(
      'Final PhonePe state:',
      state
    );

    /*
     * Only COMPLETED can mark the order as paid.
     */
    if (state === 'COMPLETED') {
      const phonePeAmount =
        toFiniteNumber(
          statusResponse?.amount ??
            statusResponse?.data?.amount,
          0
        );

      const expectedAmount =
        Math.round(
          toFiniteNumber(
            order.grandTotal,
            toFiniteNumber(
              order.totalAmount,
              0
            )
          ) * 100
        );

      /*
       * Verify payment amount.
       */
      if (
        phonePeAmount > 0 &&
        phonePeAmount !==
          expectedAmount
      ) {
        console.error(
          'Payment amount mismatch:',
          {
            phonePeAmount,
            expectedAmount,
          }
        );

        return res.redirect(
          `${frontendUrl}/`
        );
      }

      const transactionId =
        statusResponse?.transactionId ||
        statusResponse?.data
          ?.transactionId ||
        statusResponse
          ?.transactionDetails?.[0]
          ?.transactionId ||
        statusResponse?.data
          ?.transactionDetails?.[0]
          ?.transactionId ||
        merchantOrderId;

      const now = new Date();

      order.paymentStatus =
        'Paid';

      order.paymentMethod =
        'PhonePe';

      order.transactionId =
        String(transactionId);

      order.phonePeTransactionId =
        String(transactionId);

      order.amountPaid =
        toFiniteNumber(
          order.grandTotal,
          toFiniteNumber(
            order.totalAmount,
            0
          )
        );

      order.paymentDate =
        now.toISOString().slice(
          0,
          10
        );

      order.paymentTime =
        now.toLocaleTimeString();

      /*
       * IMPORTANT:
       * "Payment Confirmed" is NOT allowed
       * by the Order schema enum.
       *
       * Use "confirmed".
       */
      order.status =
        'confirmed';

      await order.save();

      console.log(
        '========================================'
      );

      console.log(
        'PHONEPE PAYMENT SUCCESSFUL'
      );

      console.log(
        'YAMINI ORDER:',
        order.orderId
      );

      console.log(
        'PHONEPE ORDER:',
        merchantOrderId
      );

      console.log(
        'TRANSACTION:',
        transactionId
      );

      console.log(
        'AMOUNT:',
        order.amountPaid
      );

      console.log(
        'CUSTOMER EMAIL:',
        order.email
      );

      console.log(
        'SENDING PAYMENT SUCCESS EMAIL...'
      );

      console.log(
        '========================================'
      );

      /*
       * Send Payment Successful Email.
       *
       * This happens ONLY after:
       * 1. PhonePe says COMPLETED
       * 2. Amount is verified
       * 3. Order is saved as Paid
       *
       * Email failure will NOT make the payment fail.
       */
      await sendPaymentSuccessEmail(
        order
      );

      /*
       * SUCCESS:
       * Customer goes directly to Yamini Home.
       */
      return res.redirect(
        `${frontendUrl}/`
      );
    }

    /*
     * Payment failed/cancelled.
     */
    if (
      state === 'FAILED' ||
      state === 'FAILURE' ||
      state === 'CANCELLED'
    ) {
      order.paymentStatus =
        'Failed';

      await order.save();

      return res.redirect(
        `${frontendUrl}/`
      );
    }

    /*
     * Pending/unknown state.
     *
     * Do not mark the order as paid.
     */
    return res.redirect(
      `${frontendUrl}/`
    );
  } catch (error) {
    console.error(
      'PhonePe return/verification error:',
      error
    );

    /*
     * Even if verification encounters
     * an error, never show a callback page.
     */
    return res.redirect(
      `${frontendUrl}/`
    );
  }
};

module.exports = {
  createPhonePeOrder,
  handlePhonePeReturn,
};