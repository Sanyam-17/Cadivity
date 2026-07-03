import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/server/db";
import { getOrderStatus } from "@/lib/server/phonepe";
import { logger } from "@/lib/server/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const merchantOrderId = searchParams.get("merchantOrderId");

  if (!merchantOrderId) {
    logger.error("payment.redirect.missingOrderId");
    redirect("/courses?payment=error");
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { merchantOrderId },
      select: {
        id: true,
        courseId: true,
        guestEmail: true,
        course: { select: { slug: true } },
      },
    });

    if (!payment) {
      logger.error("payment.redirect.notFound", { merchantOrderId });
      redirect("/courses?payment=error");
    }

    const courseSlug = payment.course.slug;

    const status = await getOrderStatus(merchantOrderId);

    logger.info("payment.redirect.status", {
      merchantOrderId,
      state: status.state,
      courseSlug,
    });

    switch (status.state) {
      case "COMPLETED": {
        const params = new URLSearchParams({ course: courseSlug });
        // Guest checkouts get routed through the success page's OTP
        // sign-in step. Authenticated checkouts go straight through too —
        // the success page handles both cases.
        if (payment.guestEmail) {
          params.set("newAccount", "1");
          params.set("email", payment.guestEmail);
        }
        redirect(`/checkout/success?${params.toString()}`);
        break;
      }

      case "FAILED":
        redirect(`/courses/${courseSlug}?payment=failed`);
        break;

      default:
        redirect(
          `/checkout/pending?orderId=${encodeURIComponent(merchantOrderId)}`
        );
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    logger.error("payment.redirect.error", {
      merchantOrderId,
      error: error instanceof Error ? error.message : String(error),
    });
    redirect("/courses?payment=error");
  }
}