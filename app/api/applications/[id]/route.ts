import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId } = await params;
    const body = await request.json();
    const nextStatus = body?.status as
      | "APPLIED"
      | "REVIEWED"
      | "SHORTLISTED"
      | "INTERVIEWED"
      | "REJECTED"
      | "ACCEPTED";

    const allowed = [
      "APPLIED",
      "REVIEWED",
      "SHORTLISTED",
      "INTERVIEWED",
      "REJECTED",
      "ACCEPTED",
    ];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Ensure the logged-in employer owns the job for this application (or admin)
    const app = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      select: { job: { select: { employerId: true } } },
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    const ownsJob = app.job.employerId === session.user.id && session.user.role === "EMPLOYER";
    const isAdmin = session.user.role === "ADMIN";
    if (!ownsJob && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: nextStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Application status update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


