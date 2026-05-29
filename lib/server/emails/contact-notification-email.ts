/**
 * Professional notification email template sent to the Cadivity team
 * when a user submits the contact form.
 */
export function getContactNotificationEmailHtml({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): string {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#093475 0%,#0c4a9e 60%,#0891b2 100%);padding:32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                      📩 New Contact Inquiry
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">
                      Received on ${timestamp}
                    </p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:600;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">
                      New Lead
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <!-- Contact Details Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <!-- Name -->
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:120px;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Name</p>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${name}</p>
                  </td>
                </tr>
                <!-- Email -->
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Email</p>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <a href="mailto:${email}" style="color:#093475;font-size:15px;text-decoration:none;font-weight:500;">${email}</a>
                  </td>
                </tr>
                <!-- Phone -->
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Phone</p>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <a href="tel:${phone}" style="color:#093475;font-size:15px;text-decoration:none;font-weight:500;">${phone}</a>
                  </td>
                </tr>
                <!-- Subject -->
                <tr>
                  <td style="padding:14px 16px;vertical-align:top;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Subject</p>
                  </td>
                  <td style="padding:14px 16px;vertical-align:top;">
                    <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${subject}</p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <h2 style="margin:0 0 12px;color:#1e293b;font-size:16px;font-weight:700;">
                Message
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #093475;border-radius:8px;padding:20px 24px;">
                    <p style="margin:0;color:#334155;font-size:14px;line-height:1.8;white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>

              <!-- Quick Actions -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display:inline-block;background:linear-gradient(135deg,#093475,#0c4a9e);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
                      Reply to ${name.split(" ")[0]}
                    </a>
                  </td>
                  <td>
                    <a href="tel:${phone}" style="display:inline-block;background:#f1f5f9;color:#1e293b;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;border:1px solid #e2e8f0;">
                      📞 Call
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                Sent via Cadivity Contact Form · <a href="https://cadivity.com/contact" style="color:#093475;text-decoration:none;">cadivity.com/contact</a>
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
