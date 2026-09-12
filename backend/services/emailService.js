const nodemailer = require('nodemailer');
 
// ======================================================
// EMAIL ENVIRONMENT DEBUG
// ======================================================
 
console.log('========== EMAIL DEBUG ==========');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
 
console.log(
  'EMAIL_APP_PASSWORD length:',
  process.env.EMAIL_APP_PASSWORD
    ? process.env.EMAIL_APP_PASSWORD.length
    : 0
);
 
console.log('=================================');
 
 
// ======================================================
// GMAIL TRANSPORTER
// ======================================================
 
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
 
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});
 
 
// ======================================================
// TEST EMAIL CONNECTION
// ======================================================
 
console.log('Testing Gmail connection...');
 
transporter.verify((error, success) => {
  if (error) {
    console.error('======================================');
    console.error('❌ EMAIL CONNECTION FAILED');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('======================================');
  } else {
    console.log('======================================');
    console.log('✅ EMAIL SERVER CONNECTED SUCCESSFULLY');
    console.log('======================================');
  }
});
 
 
// ======================================================
// 1. ORDER CONFIRMATION EMAIL
// ======================================================
 
const sendOrderConfirmationEmail = async (order) => {
  try {
    if (!order?.email) {
      console.log(
        'Order confirmation email skipped: customer email missing'
      );
      return false;
    }
 
    const mailOptions = {
      from: `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,
      to: order.email,
 
      subject: `Order Confirmation - ${order.orderId}`,
 
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Order Confirmation</title>
        </head>
 
        <body style="
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
        ">
 
          <div style="
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 10px;
          ">
 
            <h2 style="text-align:center;">
              YAMINI FLEX PRINTING
            </h2>
 
            <h3>Order Confirmed</h3>
 
            <p>
              Dear ${order.name || 'Customer'},
            </p>
 
            <p>
              Thank you for placing your order with
              <strong>YAMINI FLEX PRINTING</strong>.
            </p>
 
            <p>
              Your order has been successfully received.
            </p>
 
            <hr>
 
            <p>
              <strong>Order ID:</strong>
              ${order.orderId || 'N/A'}
            </p>
 
            <p>
              <strong>Quantity:</strong>
              ${order.quantity || 'N/A'}
            </p>
 
            <p>
              <strong>Material:</strong>
              ${order.material || 'N/A'}
            </p>
 
            <p>
              <strong>Payment Method:</strong>
              ${order.paymentMethod || 'N/A'}
            </p>
 
            <p>
              <strong>Payment Status:</strong>
              ${order.paymentStatus || 'Pending'}
            </p>
 
            <p>
              <strong>Total Amount:</strong>
              ₹${order.grandTotal || order.totalAmount || order.price || 0}
            </p>
 
            <hr>
 
            <p>
              We will process your order and keep you updated
              about its status.
            </p>
 
            <p>
              Thank you for choosing YAMINI FLEX PRINTING.
            </p>
 
          </div>
 
        </body>
        </html>
      `,
    };
 
    console.log('======================================');
    console.log('Sending order confirmation email...');
    console.log('To:', order.email);
    console.log('Order ID:', order.orderId);
    console.log('======================================');
 
    const info = await transporter.sendMail(mailOptions);
 
    console.log('======================================');
    console.log('✅ ORDER CONFIRMATION EMAIL SENT');
    console.log('Message ID:', info.messageId);
    console.log('To:', order.email);
    console.log('======================================');
 
    return true;
 
  } catch (error) {
 
    console.error('======================================');
    console.error('❌ ORDER CONFIRMATION EMAIL FAILED');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('======================================');
 
    return false;
  }
};
 
 
// ======================================================
// 2. PAYMENT SUCCESS EMAIL
// ======================================================
 
const sendPaymentSuccessEmail = async (order) => {
  try {
    if (!order?.email) {
      console.log(
        'Payment email skipped: customer email missing'
      );
      return false;
    }
 
    const paidAmount =
      order.amountPaid ||
      order.grandTotal ||
      order.totalAmount ||
      order.price ||
      0;
 
    const mailOptions = {
      from: `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,
 
      to: order.email,
 
      subject: `Payment Successful - ${order.orderId}`,
 
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Successful</title>
        </head>
 
        <body style="
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
        ">
 
          <div style="
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 10px;
          ">
 
            <h2 style="text-align:center;">
              YAMINI FLEX PRINTING
            </h2>
 
            <h3 style="text-align:center;">
              Payment Successful
            </h3>
 
            <p>
              Dear ${order.name || 'Customer'},
            </p>
 
            <p>
              Your payment has been successfully received.
            </p>
 
            <p>
              Thank you for your payment.
            </p>
 
            <hr>
 
            <h4>Payment Details</h4>
 
            <p>
              <strong>Order ID:</strong>
              ${order.orderId || 'N/A'}
            </p>
 
            <p>
              <strong>Amount Paid:</strong>
              ₹${paidAmount}
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
              <strong>Transaction ID:</strong>
              ${order.transactionId || order.phonePeTransactionId || 'N/A'}
            </p>
 
            <p>
              <strong>Payment Date:</strong>
              ${
                order.paymentDate
                  ? new Date(order.paymentDate).toLocaleDateString()
                  : 'N/A'
              }
            </p>
 
            <hr>
 
            <p>
              Your order is now being processed.
            </p>
 
            <p>
              We will keep you updated about your order status.
            </p>
 
            <p>
              Thank you for choosing
              <strong>YAMINI FLEX PRINTING</strong>.
            </p>
 
          </div>
 
        </body>
        </html>
      `,
    };
 
    console.log('======================================');
    console.log('💳 Sending payment success email...');
    console.log('To:', order.email);
    console.log('Order ID:', order.orderId);
    console.log('Amount:', paidAmount);
    console.log('Transaction ID:', order.transactionId);
    console.log('======================================');
 
    const info = await transporter.sendMail(mailOptions);
 
    console.log('======================================');
    console.log('✅ PAYMENT SUCCESS EMAIL SENT');
    console.log('Message ID:', info.messageId);
    console.log('To:', order.email);
    console.log('======================================');
 
    return true;
 
  } catch (error) {
 
    console.error('======================================');
    console.error('❌ PAYMENT SUCCESS EMAIL FAILED');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('======================================');
 
    return false;
  }
};
 
 
// ======================================================
// 3. ORDER STATUS UPDATE EMAIL
// ======================================================
 
const sendOrderStatusUpdateEmail = async (order, oldStatus) => {
  try {
    if (!order?.email) {
      console.log(
        'Status email skipped: customer email missing'
      );
      return false;
    }
 
    const mailOptions = {
      from: `"YAMINI FLEX PRINTING" <${process.env.EMAIL_USER}>`,
 
      to: order.email,
 
      subject: `Order Update - ${order.orderId}`,
 
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Order Status Update</title>
        </head>
 
        <body style="
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
        ">
 
          <div style="
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 10px;
          ">
 
            <h2 style="text-align:center;">
              YAMINI FLEX PRINTING
            </h2>
 
            <h3>Order Status Updated</h3>
 
            <p>
              Dear ${order.name || 'Customer'},
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
              We will continue to keep you updated
              about your order.
            </p>
 
            <p>
              Thank you for choosing
              <strong>YAMINI FLEX PRINTING</strong>.
            </p>
 
          </div>
 
        </body>
        </html>
      `,
    };
 
    console.log('======================================');
    console.log('📦 Sending order status email...');
    console.log('To:', order.email);
    console.log('Order ID:', order.orderId);
    console.log('Old Status:', oldStatus);
    console.log('New Status:', order.status);
    console.log('======================================');
 
    const info = await transporter.sendMail(mailOptions);
 
    console.log('======================================');
    console.log('✅ ORDER STATUS EMAIL SENT');
    console.log('Message ID:', info.messageId);
    console.log('To:', order.email);
    console.log('======================================');
 
    return true;
 
  } catch (error) {
 
    console.error('======================================');
    console.error('❌ ORDER STATUS EMAIL FAILED');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('======================================');
 
    return false;
  }
};
 
 
// ======================================================
// EXPORT FUNCTIONS
// ======================================================
 
module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendOrderStatusUpdateEmail,
};
 
