/**
 * Enrollment confirmation email sent to the student after successful
 * PhonePe payment + enrollment creation.
 */
export function getEnrollmentConfirmationEmailHtml({
  studentName,
  courseTitle,
  courseSlug,
  amountPaise,
  merchantOrderId,
}: {
  studentName: string;
  courseTitle: string;
  courseSlug: string;
  amountPaise: number;
  merchantOrderId: string;
}): string {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const amountFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountPaise / 100);

  const courseUrl = `https://www.cadivity.com/courses/${courseSlug}/play`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enrollment Confirmed — Cadivity</title>
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
                      🎉 Enrollment Confirmed!
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">
                      ${timestamp}
                    </p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:600;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">
                      Paid
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
                Hi <strong>${studentName}</strong>,<br/><br/>
                Your payment was successful and you are now enrolled in the course below. You can start learning right away!
              </p>

              <!-- Course Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:120px;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Course</p>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${courseTitle}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Amount Paid</p>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${amountFormatted}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;vertical-align:top;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Order ID</p>
                  </td>
                  <td style="padding:14px 16px;vertical-align:top;">
                    <p style="margin:0;color:#1e293b;font-size:13px;font-family:monospace;">${merchantOrderId}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${courseUrl}" style="display:inline-block;background:linear-gradient(135deg,#093475,#0c4a9e);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      Start Learning →
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
                Cadivity LMS · <a href="https://cadivity.com" style="color:#093475;text-decoration:none;">cadivity.com</a>
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
