import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import prisma from "@/lib/prisma";

// Configure Lemon Squeezy
const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
if (!apiKey) {
  console.error("LEMON_SQUEEZY_API_KEY missing");
}
if (apiKey) {
  lemonSqueezySetup({ apiKey });
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Parse request body
    let caseStudyId;
    const contentType = req.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const body = await req.json();
      caseStudyId = body.caseStudyId;
    } else {
      const formData = await req.formData();
      caseStudyId = formData.get("caseStudyId");
    }

    if (!caseStudyId) {
      return NextResponse.json(
        { error: "Case Study ID required" },
        { status: 400 }
      );
    }

    // Get User from DB
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if VC report already exists
    const existingReport = await prisma.vCReport.findUnique({
      where: { caseStudyId },
    });

    if (existingReport) {
      // Report already generated, redirect to it
      return NextResponse.json({
        success: true,
        redirectUrl: `/vc-reports/${existingReport.id}`,
        message: "Report already exists"
      });
    }

    // Fetch case study
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id: caseStudyId },
      select: { slug: true, title: true },
    });

    if (!caseStudy) {
      return NextResponse.json(
        { error: "Case Study not found" },
        { status: 404 }
      );
    }

    // Check for existing pending/paid payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        caseStudyId,
        status: { in: ["pending", "paid"] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingPayment && existingPayment.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already completed. Report is being generated.",
        status: "processing"
      });
    }

    // Lemon Squeezy environment variables
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

    if (!storeId || !variantId || !apiKey) {
      console.error("Lemon Squeezy env vars missing", {
        hasApiKey: !!apiKey,
        storeId,
        variantId,
      });
      return NextResponse.json(
        { error: "Payment configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/case-studies/${caseStudy.slug}?payment=success`;

    console.log("Creating checkout for:", {
      userId: user.id,
      caseStudyId,
      email: user.email,
    });

    // Create Lemon Squeezy checkout
    const checkout = await createCheckout(
      parseInt(storeId, 10),
      parseInt(variantId, 10),
      {
        checkoutData: {
          email: user.email,
          custom: {
            user_id: user.id,
            case_study_id: caseStudyId,
          },
        },
        checkoutOptions: {
          embed: false,
          media: false,
          logo: true,
        },
        productOptions: {
          name: `VC Report: ${caseStudy.title}`,
          description: "AI-generated VC investment analysis report",
          redirectUrl: successUrl,
          receiptButtonText: "View Report",
          receiptLinkUrl: successUrl,
          receiptThankYouNote: "Your report is being generated and will be ready shortly!",
        },
      }
    );

    if (checkout.error) {
      console.error("Lemon Squeezy returned error:", checkout.error);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    const checkoutUrl = checkout.data?.data?.attributes?.url;
    if (!checkoutUrl) {
      console.error("No checkout URL in response:", checkout);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Create or update pending payment record
    if (existingPayment && existingPayment.status === "pending") {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          lemonSqueezyCheckoutId: checkout.data.data.id,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          userId: user.id,
          caseStudyId,
          status: "pending",
          lemonSqueezyCheckoutId: checkout.data.data.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    if (error.errors) {
      console.error(
        "Lemon Squeezy Validation Errors:",
        JSON.stringify(error.errors, null, 2)
      );
    }
    const errorMessage = error.message || "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}