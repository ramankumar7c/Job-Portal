export const dynamic = 'force-dynamic';
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

    if (session.user.role !== "JOB_SEEKER") {
      return NextResponse.json(
        { error: "Only job seekers can view application stats" },
        { status: 403 }
      );
    }

    const [
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      reviewedApplications,
      interviewedApplications,
      rejectedApplications,
      acceptedApplications,
    ] = await Promise.all([
      prisma.jobApplication.count({
        where: { applicantId: session.user.id },
      }),
      prisma.jobApplication.count({
        where: { 
          applicantId: session.user.id,
          status: "APPLIED"
        },
      }),
      prisma.jobApplication.count({
        where: { 
          applicantId: session.user.id,
          status: "SHORTLISTED"
        },
      }),
      prisma.jobApplication.count({
        where: { 
          applicantId: session.user.id,
          status: "REVIEWED"
        },
      }),
      prisma.jobApplication.count({
        where: { 
          applicantId: session.user.id,
          status: "INTERVIEWED"
        },
      }),
      prisma.jobApplication.count({
        where: { 
          applicantId: session.user.id,
          status: "REJECTED"
        },
      }),
      prisma.jobApplication.count({
        where: { 
          applicantId: session.user.id,
          status: "ACCEPTED"
        },
      }),
    ]);

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      reviewedApplications,
      interviewedApplications,
      rejectedApplications,
      acceptedApplications,
    });
  } catch (error) {
    console.error("Application stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
