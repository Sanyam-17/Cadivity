/**
 * Professional auto-reply email template sent to the user
 * after they submit the contact form.
 */
export function getAutoReplyEmailHtml({
  name,
  subject,
}: {
  name: string;
  subject: string;
}): string {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank you for contacting Cadivity</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Email Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#093475 0%,#0c4a9e 50%,#0891b2 100%);padding:48px 40px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <img src="https://cadivity.com/Cadivity.png" alt="Cadivity" width="160" style="display:block;height:auto;max-width:160px;background:rgba(255,255,255,0.95);border-radius:12px;padding:8px 16px;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!-- Checkmark Circle -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;font-size:28px;line-height:64px;">
                          ✓
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:20px;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                      We've Received Your Message
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">
                      Thank you for reaching out to us
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">

              <!-- Greeting -->
              <p style="margin:0 0 20px;color:#1e293b;font-size:16px;line-height:1.6;">
                Hi <strong>${name}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
                Thank you for contacting <strong>Cadivity</strong>. We've successfully received your inquiry and our team is already reviewing it.
              </p>

              <!-- Inquiry Summary Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
                    <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Your Inquiry
                    </p>
                    <p style="margin:0;color:#1e293b;font-size:16px;font-weight:600;">
                      ${subject}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What to Expect -->
              <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:700;">
                What happens next?
              </h2>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <!-- Step 1 -->
                <tr>
                  <td style="padding:12px 0;vertical-align:top;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;">
                          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#093475,#0891b2);color:#fff;font-size:14px;font-weight:700;text-align:center;line-height:32px;">
                            1
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:top;">
                          <p style="margin:0 0 2px;color:#1e293b;font-size:14px;font-weight:600;">Review</p>
                          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">Our team reviews your message and assigns it to the right expert.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Step 2 -->
                <tr>
                  <td style="padding:12px 0;vertical-align:top;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;">
                          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#093475,#0891b2);color:#fff;font-size:14px;font-weight:700;text-align:center;line-height:32px;">
                            2
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:top;">
                          <p style="margin:0 0 2px;color:#1e293b;font-size:14px;font-weight:600;">Response</p>
                          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">We'll get back to you within <strong>24 hours</strong> with a detailed response.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Step 3 -->
                <tr>
                  <td style="padding:12px 0;vertical-align:top;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;">
                          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#093475,#0891b2);color:#fff;font-size:14px;font-weight:700;text-align:center;line-height:32px;">
                            3
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:top;">
                          <p style="margin:0 0 2px;color:#1e293b;font-size:14px;font-weight:600;">Follow-up</p>
                          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">If needed, we'll schedule a call to discuss your requirements in detail.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="height:1px;background:linear-gradient(to right,transparent,#e2e8f0,transparent);"></td>
                </tr>
              </table>

              <!-- Need Immediate Help -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#f0f9ff,#f0fdf4);border:1px solid #e0f2fe;border-radius:12px;padding:24px;">
                    <p style="margin:0 0 8px;color:#1e293b;font-size:15px;font-weight:700;">
                      Need immediate assistance?
                    </p>
                    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
                      Call us at <a href="tel:+916372495858" style="color:#093475;font-weight:600;text-decoration:none;">+91-6372495858</a>
                      <br />
                      Available Mon – Sat, 10 AM – 7 PM IST
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1e293b;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 12px;color:rgba(255,255,255,0.7);font-size:13px;">
                <a href="https://cadivity.com" style="color:#38bdf8;text-decoration:none;font-weight:600;">cadivity.com</a>
                &nbsp;·&nbsp;
                <a href="mailto:enquiry@cadivity.com" style="color:#38bdf8;text-decoration:none;">enquiry@cadivity.com</a>
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px;">
                © ${currentYear} Cadivity. All rights reserved.
              </p>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.3);font-size:11px;">
                This is an automated confirmation. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}
