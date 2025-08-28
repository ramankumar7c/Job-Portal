import { z } from "zod";

export const jobListingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]),
  level: z.enum(["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"]),
  salary: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
});

export const jobApplicationSchema = z.object({
  coverLetter: z.string().optional(),
});

export type JobListingData = z.infer<typeof jobListingSchema>;
export type JobApplicationData = z.infer<typeof jobApplicationSchema>;