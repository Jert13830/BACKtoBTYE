const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SOURCE,
    pass: process.env.EMAIL_PASS,
  },
});

//Send the reset password email
async function sendEmailConfirmAccount(to, subject, text, html = null) {
  return transporter.sendMail({
    from: `"BACKtoBYTE" <${process.env.EMAIL_SOURCE}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = sendEmailConfirmAccount;