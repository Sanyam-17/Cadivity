/**
 * Certificate issuance email sent to the student after they successfully
 * generate their certificate for the first time.
 */
export function getCertificateEmailHtml({
  studentName,
  courseTitle,
  verificationUrl,
}: {
  studentName: string;
  courseTitle: string;
  verificationUrl: string;
}): string {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Cadivity Certificate</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#093475 0%,#0c4a9e 60%,#0891b2 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                🎓 Congratulations!
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">
                You've completed ${courseTitle}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
                Hi <strong>${studentName}</strong>,<br/><br/>
                We are thrilled to present your Certificate of Completion! Your dedication and hard work have paid off. Please find your official certificate attached to this email as a PDF.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f8fafc;border-radius:12px;padding:20px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Course</p>
                    <p style="margin:4px 0 0;color:#0f172a;font-size:16px;font-weight:700;">${courseTitle}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Date Issued</p>
                    <p style="margin:4px 0 0;color:#0f172a;font-size:16px;font-weight:700;">${timestamp}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                You can also share your achievement online or with prospective employers using the unique verification link below:
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display:inline-block;background:#0f172a;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      Verify Certificate Online
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
