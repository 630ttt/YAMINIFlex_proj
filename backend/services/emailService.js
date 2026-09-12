
const nodemailer = require('nodemailer');

// ==================================================
// EMAIL ENVIRONMENT DEBUG
// ==================================================

console.log('========== EMAIL DEBUG ==========');

console.log(
  'NODE_ENV:',
  process.env.NODE_ENV || 'not set'
);

console.log(
  'EMAIL_USER exists:',
  !!process.env.EMAIL_USER
);

console.log(
  'EMAIL_APP_PASSWORD exists:',
  !!process.env.EMAIL_APP_PASSWORD
);

console.log(
  'EMAIL_APP_PASSWORD length:',
  process.env.EMAIL_APP_PASSWORD
    ? process.env.EMAIL_APP_PASSWORD.length
    : 0
);

console.log('=================================');


// ==================================================
// CHECK REQUIRED EMAIL VARIABLES
// ==================================================

if (!process.env.EMAIL_USER) {
  console.error(
    'EMAIL_USER is not configured.'
  );
}

if (!process.env.EMAIL_APP_PASSWORD) {
  console.error(
    'EMAIL_APP_PASSWORD is not configured.'
  );
}


// ==================================================
// CREATE GMAIL TRANSPORTER
// ==================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },

  // Prevent SMTP connection from hanging for a long time
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});


// ==================================================
// VERIFY EMAIL CONNECTION
// ==================================================

transporter
  .verify()
  .then(() => {
    console.log(
      '======================================'
    );

    console.log(
      'EMAIL SERVER CONNECTED SUCCESSFULLY'
    );

    console.log(
      '======================================'
    );
  })
  .catch((error) => {
    console.error(
      '======================================'
    );

    console.error(
      'EMAIL SERVER CONNECTION FAILED'
    );

    console.error(
      'Error:',
      error.message
    );

    console.error(
      '======================================'
    );
  });


// ==================================================
// ORDER CONFIRMATION EMAIL
// ==================================================

const sendOrderConfirmationEmail = async (
  order
) => {
  try {
    if (!order?.email) {
      console.log(
        'Order confirmation email skipped: customer email missing'
      );

      return;
    }

    const mailOptions = {
      from:
        `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,

      to: order.email,

      subject:
        `Order Confirmation - ${order.orderId}`,

      html: `
        <!DOCTYPE html>

        <html>

        <head>
          <meta charset="UTF-8">
          <title>Order Confirmation</title>
        </head>

        <body
          style="
            margin:0;
            padding:20px;
            background:#f5f5f5;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              max-width:600px;
              margin:auto;
              background:white;
              padding:30px;
              border-radius:10px;
            "
          >

            <h2
              style="
                text-align:center;
                margin-bottom:25px;
              "
            >
              YAMINI FLEX PRINTING
            </h2>

            <h3>
              Order Confirmed
            </h3>

            <p>
              Dear
              <strong>
                ${order.name || 'Customer'}
              </strong>,
            </p>

            <p>
              Thank you for placing your order
              with YAMINI FLEX PRINTING.
            </p>

            <p>
              Your order has been successfully
              received.
            </p>

            <hr>

            <h3>
              Order Details
            </h3>

            <p>
              <strong>Order ID:</strong>
              ${order.orderId || 'N/A'}
            </p>

            <p>
              <strong>Quantity:</strong>
              ${order.quantity || 1}
            </p>

            <p>
              <strong>Material:</strong>
              ${order.material || 'N/A'}
            </p>

            <p>
              <strong>Payment Method:</strong>
              ${order.paymentMethod || 'COD'}
            </p>

            <p>
              <strong>Order Status:</strong>
              ${order.status || 'pending'}
            </p>

            <p>
              <strong>Total Amount:</strong>
              ₹${order.grandTotal || order.totalAmount || 0}
            </p>

            <hr>

            <p>
              We will keep you updated about
              your order.
            </p>

            <p>
              Thank you for choosing
              <strong>
                YAMINI FLEX PRINTING
              </strong>.
            </p>

          </div>

        </body>

        </html>
      `,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      '======================================'
    );

    console.log(
      'ORDER CONFIRMATION EMAIL SENT'
    );

    console.log(
      'Message ID:',
      info.messageId
    );

    console.log(
      'To:',
      order.email
    );

    console.log(
      '======================================'
    );

  } catch (error) {
    console.error(
      'Order confirmation email error:',
      error.message
    );
  }
};


// ==================================================
// PAYMENT SUCCESS EMAIL
// ==================================================

const sendPaymentSuccessEmail = async (
  order
) => {
  try {
    if (!order?.email) {
      console.log(
        'Payment email skipped: customer email missing'
      );

      return;
    }

    const mailOptions = {
      from:
        `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,

      to: order.email,

      subject:
        `Payment Successful - ${order.orderId}`,

      html: `
        <!DOCTYPE html>

        <html>

        <head>
          <meta charset="UTF-8">
          <title>Payment Successful</title>
        </head>

        <body
          style="
            margin:0;
            padding:20px;
            background:#f5f5f5;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              max-width:600px;
              margin:auto;
              background:white;
              padding:30px;
              border-radius:10px;
            "
          >

            <h2
              style="
                text-align:center;
              "
            >
              YAMINI FLEX PRINTING
            </h2>

            <h3>
              Payment Successful
            </h3>

            <p>
              Dear
              <strong>
                ${order.name || 'Customer'}
              </strong>,
            </p>

            <p>
              Your payment has been successfully
              received.
            </p>

            <hr>

            <h3>
              Payment Details
            </h3>

            <p>
              <strong>Order ID:</strong>
              ${order.orderId || 'N/A'}
            </p>

            <p>
              <strong>Payment Method:</strong>
              ${order.paymentMethod || 'PhonePe'}
            </p>

            <p>
              <strong>Payment Status:</strong>
              ${order.paymentStatus || 'Paid'}
            </p>

            <p>
              <strong>Amount Paid:</strong>
              ₹${order.amountPaid || 0}
            </p>

            <p>
              <strong>Transaction ID:</strong>
              ${order.transactionId || 'N/A'}
            </p>

            <p>
              <strong>Payment Date:</strong>
              ${order.paymentDate || 'N/A'}
            </p>

            <p>
              <strong>Payment Time:</strong>
              ${order.paymentTime || 'N/A'}
            </p>

            <hr>

            <p>
              Your order has been confirmed
              and will proceed for processing.
            </p>

            <p>
              Thank you for choosing
              <strong>
                YAMINI FLEX PRINTING
              </strong>.
            </p>

          </div>

        </body>

        </html>
      `,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      '======================================'
    );

    console.log(
      'PAYMENT SUCCESS EMAIL SENT'
    );

    console.log(
      'Message ID:',
      info.messageId
    );

    console.log(
      'To:',
      order.email
    );

    console.log(
      '======================================'
    );

  } catch (error) {
    console.error(
      'Payment success email error:',
      error.message
    );
  }
};


// ==================================================
// ORDER STATUS UPDATE EMAIL
// ==================================================

const sendOrderStatusUpdateEmail = async (
  order,
  oldStatus
) => {
  try {
    if (!order?.email) {
      console.log(
        'Status email skipped: customer email missing'
      );

      return;
    }

    const mailOptions = {
      from:
        `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,

      to: order.email,

      subject:
        `Order Update - ${order.orderId}`,

      html: `
        <!DOCTYPE html>

        <html>

        <head>
          <meta charset="UTF-8">
          <title>Order Status Update</title>
        </head>

        <body
          style="
            margin:0;
            padding:20px;
            background:#f5f5f5;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              max-width:600px;
              margin:auto;
              background:white;
              padding:30px;
              border-radius:10px;
            "
          >

            <h2
              style="
                text-align:center;
              "
            >
              YAMINI FLEX PRINTING
            </h2>

            <h3>
              Order Status Updated
            </h3>

            <p>
              Dear
              <strong>
                ${order.name || 'Customer'}
              </strong>,
            </p>

            <p>
              Your order status has been updated.
            </p>

            <hr>

            <p>
              <strong>Order ID:</strong>
              ${order.orderId || 'N/A'}
            </p>

            <p>
              <strong>Previous Status:</strong>
              ${oldStatus || 'N/A'}
            </p>

            <p>
              <strong>Current Status:</strong>
              ${order.status || 'N/A'}
            </p>

            <hr>

            <p>
              Thank you for choosing
              <strong>
                YAMINI FLEX PRINTING
              </strong>.
            </p>

          </div>

        </body>

        </html>
      `,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      '======================================'
    );

    console.log(
      'ORDER STATUS EMAIL SENT'
    );

    console.log(
      'Message ID:',
      info.messageId
    );

    console.log(
      'To:',
      order.email
    );

    console.log(
      '======================================'
    );

  } catch (error) {
    console.error(
      'Order status email error:',
      error.message
    );
  }
};


// ==================================================
// EXPORT
// ==================================================

module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendOrderStatusUpdateEmail,
};

