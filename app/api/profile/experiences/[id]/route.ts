import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "Only job seekers can update experiences" },
        { status: 403 }
      );
    }

    const experienceId = params.id;
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

    // Verify ownership
    const existingExperience = await prisma.experience.findUnique({
      where: { id: experienceId },
      select: { userId: true },
    });

    if (!existingExperience || existingExperience.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Experience not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedExperience = await prisma.experience.update({
      where: { id: experienceId },
      data: {
        title,
        company,
        location,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent,
      },
    });

    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error("Experience update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "Only job seekers can delete experiences" },
        { status: 403 }
      );
    }

    const experienceId = params.id;

    // Verify ownership
    const existingExperience = await prisma.experience.findUnique({
      where: { id: experienceId },
      select: { userId: true },
    });

    if (!existingExperience || existingExperience.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Experience not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.experience.delete({
      where: { id: experienceId },
    });

    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("Experience deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
