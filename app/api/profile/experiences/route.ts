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
        { error: "Only job seekers can view experiences" },
        { status: 403 }
      );
    }

    const experiences = await prisma.experience.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error("Experiences fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { error: "Only job seekers can add experiences" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      company,
      location,
      description,
      startDate,
      endDate,
      isCurrent,
    } = body;

    const experience = await prisma.experience.create({
      data: {
        title,
        company,
        location,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent,
        userId: session.user.id,
      },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error("Experience creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
