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

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Only employers can view these applications" },
        { status: 403 }
      );
    }

    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {
          employerId: session.user.id,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
          },
        },
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            phone: true,
            bio: true,
            skills: true,
            resumeUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Employer applications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


