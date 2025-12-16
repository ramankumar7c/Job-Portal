import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: any) {
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
        { error: "Only job seekers can apply to jobs" },
        { status: 403 }
      );
    }

    const jobId = context?.params?.id as string;
    const body = await request.json();
    const { coverLetter, resumeUrl, skills } = body as {
      coverLetter?: string;
      resumeUrl?: string;
      skills?: string[];
    };

    // Check if job exists and is active
    const job = await prisma.jobListing.findUnique({
      where: { id: jobId },
      select: { id: true, isActive: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (!job.isActive) {
      return NextResponse.json(
        { error: "This job is not accepting applications" },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId: session.user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Optionally enrich applicant profile with resume/skills
    try {
      const updateData: any = {};
      if (resumeUrl && typeof resumeUrl === "string") {
        updateData.resumeUrl = resumeUrl;
      }
      if (Array.isArray(skills) && skills.length > 0) {
        updateData.skills = skills;
      }
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: updateData,
        });
      }
    } catch (e) {
      // non-fatal; still proceed with application
      console.warn("Profile enrichment skipped:", e);
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: session.user.id,
        coverLetter: coverLetter || "",
        status: "APPLIED",
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
        applicant: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Job application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
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
        { error: "Only job seekers can withdraw applications" },
        { status: 403 }
      );
    }

    const jobId = context?.params?.id as string;

    // Ensure an application exists
    const existing = await prisma.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId, applicantId: session.user.id } },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No application to withdraw" },
        { status: 404 }
      );
    }

    await prisma.jobApplication.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Application withdrawn" });
  } catch (error) {
    console.error("Job application withdraw error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}