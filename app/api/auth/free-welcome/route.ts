import { NextRequest, NextResponse } from "next/server";
import { sendFreeWelcomeEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await sendFreeWelcomeEmail({
      email,
      name: name || "Creator",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Free Welcome Email Route Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to dispatch email" }, { status: 500 });
  }
}
