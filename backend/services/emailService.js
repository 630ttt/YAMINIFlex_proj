const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },

  // Force IPv4
  family: 4,

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,

  tls: {
    rejectUnauthorized: true,
  },
});

console.log('========== EMAIL DEBUG ==========');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
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
console.log('Testing Gmail connection...');

transporter.verify((error, success) => {
  if (error) {
    console.error('======================================');
    console.error('EMAIL SERVER CONNECTION FAILED');
    console.error(error);
    console.error('======================================');
  } else {
    console.log('======================================');
    console.log('EMAIL SERVER CONNECTED SUCCESSFULLY');
    console.log('======================================');
  }
});
