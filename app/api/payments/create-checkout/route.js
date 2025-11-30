import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { lemonSqueezyApiInstance } from "@lemonsqueezy/lemonsqueezy.js";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Parse form data or JSON
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
      return NextResponse.json({ error: "Case Study ID required" }, { status: 400 });
    }

    // Get User from DB
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if report already exists
    const existingReport = await prisma.vCReport.findUnique({
      where: { caseStudyId },
    });

    if (existingReport) {
      return NextResponse.redirect(new URL(`/vc-reports/${existingReport.id}`, req.url));
    }

    // Create Checkout
    // Ideally, store STORE_ID and VARIANT_ID in env vars
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

    if (!storeId || !variantId) {
      console.error("Lemon Squeezy env vars missing");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // We use the raw API or the SDK. The SDK setup might need global config.
    // For simplicity in this demo, we'll use a fetch wrapper or the SDK if configured.
    // Let's assume standard fetch for maximum control if SDK setup is complex.
    
    const checkoutPayload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              user_id: user.id,
              case_study_id: caseStudyId,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId.toString(),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId.toString(),
            },
          },
        },
      },
    };

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Lemon Squeezy Checkout Error:", error);
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    const data = await response.json();
    const checkoutUrl = data.data.attributes.url;

    return NextResponse.redirect(checkoutUrl);

  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
