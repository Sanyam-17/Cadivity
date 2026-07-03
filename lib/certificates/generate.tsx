import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

// Register fonts if needed (we'll use standard fonts for simplicity, or we could load custom ones).
// For now, using built-in Helvetica/Times.

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0f1929", // dark navy
    padding: 40,
    flexDirection: "column",
    alignItems: "center",
  },
  border: {
    border: "4px solid #d4af37", // Gold accent line
    padding: 30,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 28,
    color: "#d4af37",
    fontWeight: "bold",
    letterSpacing: 4,
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    color: "#ffffff",
    fontFamily: "Times-Roman",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 10,
  },
  studentName: {
    fontSize: 36,
    color: "#d4af37",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginVertical: 20,
    borderBottom: "1px solid #d4af37",
    paddingBottom: 5,
    width: "80%",
  },
  courseTitle: {
    fontSize: 24,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
  },
  signatureBlock: {
    flexDirection: "column",
    alignItems: "center",
    width: "30%",
  },
  signatureLine: {
    borderTop: "1px solid #94a3b8",
    width: "100%",
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  meta: {
    flexDirection: "column",
    alignItems: "center",
  },
  metaText: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 3,
  },
});

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  issueDate: string;
  certificateNumber: string;
  verificationUrl: string;
}

const CertificateDoc: React.FC<CertificateProps> = ({
  studentName,
  courseTitle,
  issueDate,
  certificateNumber,
  verificationUrl,
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.header}>
          <Text style={styles.logo}>CADIVITY</Text>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.subtitle}>This certifies that</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.subtitle}>has successfully completed</Text>
          <Text style={styles.courseTitle}>{courseTitle}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Course Instructor</Text>
          </View>

          <View style={styles.meta}>
            <Text style={styles.metaText}>Issued: {issueDate}</Text>
            <Text style={styles.metaText}>ID: {certificateNumber}</Text>
            <Text style={styles.metaText}>{verificationUrl}</Text>
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Platform Director</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export async function generateCertificatePdf(data: CertificateProps): Promise<Buffer> {
  // @ts-ignore - renderToBuffer is available in Node context for @react-pdf/renderer
  return await renderToBuffer(<CertificateDoc {...data} />);
}
