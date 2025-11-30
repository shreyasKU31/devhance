import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVCReportContent } from "@/lib/ai";
import crypto from "crypto";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "");
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(req.headers.get("x-signature") || "", "utf8");

    if (!crypto.timingSafeEqual(digest, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const eventName = body.meta.event_name;
    const customData = body.meta.custom_data; // user_id, case_study_id

    if (eventName === "order_created" || eventName === "order_paid") {
      const { user_id, case_study_id } = customData;
      
      if (!user_id || !case_study_id) {
        console.error("Missing custom data in webhook");
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      // Check if payment already recorded
      const existingPayment = await prisma.payment.findFirst({
        where: { lemonSqueezyOrderId: body.data.id },
      });

      if (existingPayment) {
        return NextResponse.json({ message: "Payment already processed" });
      }

      // Record Payment
      const payment = await prisma.payment.create({
        data: {
          userId: user_id,
          caseStudyId: case_study_id,
          lemonSqueezyOrderId: body.data.id,
          amount: body.data.attributes.total,
          currency: body.data.attributes.currency,
          status: body.data.attributes.status,
        },
      });

      // Generate VC Report
      const caseStudy = await prisma.caseStudy.findUnique({
        where: { id: case_study_id },
      });

      if (caseStudy) {
        const reportContent = await generateVCReportContent(caseStudy);
        
        const vcReport = await prisma.vCReport.create({
          data: {
            caseStudyId: case_study_id,
            userId: user_id,
            scores: reportContent.scores,
            narrativeSections: reportContent.narrativeSections,
            verdict: reportContent.verdict,
          },
        });

        // Link report to payment
        await prisma.payment.update({
          where: { id: payment.id },
          data: { vcReportId: vcReport.id },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
