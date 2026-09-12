const nodemailer = require('nodemailer');
 
// Check whether environment variables are available
console.log(
  'EMAIL_USER exists:',
  !!process.env.EMAIL_USER
);
 
console.log(
  'EMAIL_APP_PASSWORD exists:',
  !!process.env.EMAIL_APP_PASSWORD
);
 
// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});
 
// Verify Gmail connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error(
      'Email service configuration error:',
      error.message
    );
  } else {
    console.log(
      'Email server is ready and connected to Gmail'
    );
  }
});
 
// --------------------------------------------------
// ORDER CONFIRMATION EMAIL
// --------------------------------------------------
 
const sendOrderConfirmationEmail = async (order) => {
  try {
    if (!order?.email) {
      console.log(
        'Order confirmation email skipped: customer email missing'
      );
      return;
    }
 
    const mailOptions = {
      from: `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,
      to: order.email,
 
      subject: `Order Confirmation - ${order.orderId}`,
 
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
 
          <h2 style="text-align:center;">
            YAMINI FLEX PRINTING
          </h2>
 
          <p>Dear ${order.name || 'Customer'},</p>
 
          <p>
            Thank you for placing your order with
            <strong>YAMINI FLEX PRINTING</strong>.
          </p>
 
          <p>
            Your order has been successfully received.
          </p>
 
          <hr />
 
          <h3>Order Details</h3>
 
          <p>
            <strong>Order ID:</strong>
            ${order.orderId}
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
            <strong>Total Amount:</strong>
            ₹${order.grandTotal || order.totalAmount || 0}
          </p>
 
          <p>
            <strong>Payment Method:</strong>
            ${order.paymentMethod || 'COD'}
          </p>
 
          <p>
            <strong>Order Status:</strong>
            ${order.status || 'pending'}
          </p>
 
          <hr />
 
          <p>
            We will keep you updated about your order.
          </p>
 
          <p>
            Thank you for choosing
            <strong>YAMINI FLEX PRINTING</strong>.
          </p>
 
        </div>
      `,
    };
 
    const info =
      await transporter.sendMail(mailOptions);
 
    console.log(
      'Order confirmation email sent:',
      info.messageId
    );
  } catch (error) {
    console.error(
      'Order confirmation email error:',
      error.message
    );
  }
};
 
// --------------------------------------------------
// PAYMENT SUCCESS EMAIL
// --------------------------------------------------
 
const sendPaymentSuccessEmail = async (order) => {
  try {
    if (!order?.email) {
      console.log(
        'Payment email skipped: customer email missing'
      );
      return;
    }
 
    const mailOptions = {
      from: `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,
      to: order.email,
 
      subject: `Payment Successful - ${order.orderId}`,
 
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
 
          <h2 style="text-align:center;">
            Payment Successful
          </h2>
 
          <p>
            Dear ${order.name || 'Customer'},
          </p>
 
          <p>
            Your payment for your
            <strong>YAMINI FLEX PRINTING</strong>
            order was successful.
          </p>
 
          <hr />
 
          <h3>Payment Details</h3>
 
          <p>
            <strong>Order ID:</strong>
            ${order.orderId}
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
 
          <hr />
 
          <p>
            Your order has been confirmed and will now
            proceed for processing.
          </p>
 
          <p>
            Thank you for choosing
            <strong>YAMINI FLEX PRINTING</strong>.
          </p>
 
        </div>
      `,
    };
 
    const info =
      await transporter.sendMail(mailOptions);
 
    console.log(
      'Payment success email sent:',
      info.messageId
    );
  } catch (error) {
    console.error(
      'Payment success email error:',
      error.message
    );
  }
};
 
// --------------------------------------------------
// ORDER STATUS UPDATE EMAIL
// --------------------------------------------------
 
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
      from: `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,
      to: order.email,
 
      subject: `Order Update - ${order.orderId}`,
 
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
 
          <h2 style="text-align:center;">
            Order Status Updated
          </h2>
 
          <p>
            Dear ${order.name || 'Customer'},
          </p>
 
          <p>
            Your order status has been updated.
          </p>
 
          <hr />
 
          <p>
            <strong>Order ID:</strong>
            ${order.orderId}
          </p>
 
          <p>
            <strong>Previous Status:</strong>
            ${oldStatus || 'N/A'}
          </p>
 
          <p>
            <strong>Current Status:</strong>
            ${order.status || 'N/A'}
          </p>
 
          <hr />
 
          <p>
            Thank you for choosing
            <strong>YAMINI FLEX PRINTING</strong>.
          </p>
 
        </div>
      `,
    };
 
    const info =
      await transporter.sendMail(mailOptions);
 
    console.log(
      'Order status email sent:',
      info.messageId
    );
  } catch (error) {
    console.error(
      'Order status email error:',
      error.message
    );
  }
};
 
module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendOrderStatusUpdateEmail,
};
 
