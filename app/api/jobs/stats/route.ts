import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Only employers can view job statistics" },
        { status: 403 }
      );
    }

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
    ] = await Promise.all([
      prisma.jobListing.count({
        where: { employerId: session.user.id },
      }),
      prisma.jobListing.count({
        where: { 
          employerId: session.user.id,
          isActive: true
        },
      }),
      prisma.jobApplication.count({
        where: {
          job: {
            employerId: session.user.id,
          },
        },
      }),
      // For now, we'll use a placeholder for views
      // In a real app, you'd track this separately
      prisma.jobListing.count({
        where: { employerId: session.user.id },
      }) * 10, // Placeholder calculation
    ]);

    return NextResponse.json({
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
    });
  } catch (error) {
    console.error("Job stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
