import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVCReportContent } from "@/lib/ai";
import crypto from "crypto";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook configuration error" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const hmac = crypto.createHmac("sha256", webhookSecret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(req.headers.get("x-signature") || "", "utf8");

    if (!crypto.timingSafeEqual(digest, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const eventName = body.meta.event_name;
    const customData = body.meta.custom_data;

    console.log("Webhook received:", { eventName, customData });

    // Handle order_created and subscription_payment_success events
    if (eventName === "order_created" || eventName === "subscription_payment_success") {
      const { user_id, case_study_id } = customData;

      if (!user_id || !case_study_id) {
        console.error("Missing custom data in webhook", { customData });
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      const orderId = body.data.id.toString();
      const orderStatus = body.data.attributes.status;

      // Check if payment already processed (idempotency)
      let payment = await prisma.payment.findUnique({
        where: { lemonSqueezyOrderId: orderId },
      });

      if (payment) {
        console.log("Payment already processed:", orderId);
        return NextResponse.json({ message: "Payment already processed" });
      }

      // Find pending payment
      payment = await prisma.payment.findFirst({
        where: {
          userId: user_id,
          caseStudyId: case_study_id,
          status: "pending",
        },
        orderBy: { createdAt: "desc" },
      });

      // Update or create payment record
      if (payment) {
        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            lemonSqueezyOrderId: orderId,
            amount: body.data.attributes.total,
            currency: body.data.attributes.currency,
            status: orderStatus,
            updatedAt: new Date(),
          },
        });
      } else {
        payment = await prisma.payment.create({
          data: {
            userId: user_id,
            caseStudyId: case_study_id,
            lemonSqueezyOrderId: orderId,
            amount: body.data.attributes.total,
            currency: body.data.attributes.currency,
            status: orderStatus,
          },
        });
      }

      console.log("Payment record updated:", { paymentId: payment.id, status: orderStatus });

      // Generate VC Report if payment is confirmed as paid
      if (orderStatus === "paid") {
        console.log("Starting VC Report generation for:", case_study_id);

        // Check if report already exists
        const existingReport = await prisma.vCReport.findUnique({
          where: { caseStudyId: case_study_id },
        });

        if (existingReport) {
          console.log("VC Report already exists:", existingReport.id);
          await prisma.payment.update({
            where: { id: payment.id },
            data: { vcReportId: existingReport.id },
          });
          return NextResponse.json({ received: true, reportId: existingReport.id });
        }

        // Fetch case study
        const caseStudy = await prisma.caseStudy.findUnique({
          where: { id: case_study_id },
        });

        if (!caseStudy) {
          console.error("Case study not found:", case_study_id);
          return NextResponse.json(
            { error: "Case study not found" },
            { status: 404 }
          );
        }

        // Generate report content
        const reportContent = await generateVCReportContent(caseStudy);

        // Create VC Report
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

        console.log("VC Report generated successfully:", vcReport.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error.message },
      { status: 500 }
    );
  }
}