"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Building2,
  ArrowLeft,
  CheckCircle,
  Star,
  Share2,
  Bookmark,
  Send
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  level: string;
  salary?: string;
  requirements: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  employer: {
    id: string;
    name?: string;
    companyName?: string;
    companyBio?: string;
    companySize?: string;
    website?: string;
  };
  _count: {
    applications: number;
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [coverLetter, setCoverLetter] = useState("");

  const jobId = params.id as string;

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        toast.error("Job not found");
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/applications/check/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setHasApplied(data.hasApplied);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleApply = async () => {
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "JOB_SEEKER") {
      toast.error("Only job seekers can apply to jobs");
      return;
    }

    setApplying(true);
    // Validate resume URL if provided
    if (resumeUrl.trim()) {
      try {
        const u = new URL(resumeUrl.trim());
        if (!/^https?:$/.test(u.protocol)) {
          setResumeError("Please enter a valid http(s) URL");
          return;
        }
      } catch {
        setResumeError("Please enter a valid URL");
        return;
      }
    } else {
      setResumeError("");
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverLetter,
          resumeUrl: resumeUrl || undefined,
          skills: skills.length ? skills : undefined,
        }),
      });

      if (response.ok) {
        setHasApplied(true);
        toast.success("Application submitted successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to submit application");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "POST",
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Job removed from saved" : "Job saved successfully!");
      }
    } catch (error) {
      toast.error("Failed to save job");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job: ${job?.title} at ${job?.company}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs">
            <Button>Browse Other Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isJobSeeker = session?.user?.role === "JOB_SEEKER";
  const isEmployer = session?.user?.role === "EMPLOYER";
  const isOwner = isEmployer && session.user.id === job.employer.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/jobs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>

          {/* Job Title and Company */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    {job.employer.companyName || job.company}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                {session?.user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveJob}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                )}
              </div>
            </div>

            {/* Job Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{job.type}</div>
                <div className="text-xs text-gray-500">Job Type</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{job.level}</div>
                <div className="text-xs text-gray-500">Level</div>
              </div>
              
              {job.salary && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">{job.salary}</div>
                  <div className="text-xs text-gray-500">Salary</div>
                </div>
              )}
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Briefcase className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{job._count.applications}</div>
                <div className="text-xs text-gray-500">Applications</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements & Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {req}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            {isJobSeeker && !hasApplied && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">Submit your application. You can attach a resume link and list a few skills.</p>
                  <div>
                    <label className="text-sm font-medium text-gray-900">Resume URL</label>
                    <input
                      inputMode="url"
                      className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${resumeError ? "border-red-500" : "border-gray-300"}`}
                      placeholder="https://..."
                      value={resumeUrl}
                      onChange={(e) => {
                        setResumeUrl(e.target.value);
                        if (resumeError) setResumeError("");
                      }}
                    />
                    {resumeError && (
                      <p className="mt-1 text-xs text-red-600">{resumeError}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900">Skills (comma separated)</label>
                    <input
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="React, Node.js, AWS"
                      value={skills.join(", ")}
                      onChange={(e) => setSkills(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900">Cover letter</label>
                    <textarea
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      rows={5}
                      placeholder="Write a short cover letter..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleApply} 
                    disabled={applying}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {applying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Apply Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isJobSeeker && hasApplied && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Application Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Your application has been submitted successfully. You'll receive updates on your application status.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Link href="/applications">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full text-sm whitespace-normal break-words leading-snug h-auto py-3 min-h-[44px]"
                      >
                        View My Applications
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full text-sm whitespace-normal break-words leading-snug h-auto py-3 min-h-[44px]"
                      disabled={applying}
                      onClick={async () => {
                        setApplying(true);
                        try {
                          const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "DELETE" });
                          if (res.ok) {
                            setHasApplied(false);
                            toast.success("Application withdrawn");
                          } else {
                            const e = await res.json();
                            toast.error(e.error || "Failed to withdraw");
                          }
                        } finally {
                          setApplying(false);
                        }
                      }}
                    >
                      Withdraw Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employer Actions */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage this job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/jobs/${job.id}/edit`}>
                    <Button variant="outline" className="w-full">
                      Edit Job
                    </Button>
                  </Link>
                  <Link href={`/jobs/${job.id}/applications`}>
                    <Button className="w-full">
                      View Applications ({job._count.applications})
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.employer.companyName || job.company}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.employer.companyBio && (
                  <p className="text-sm text-gray-600">{job.employer.companyBio}</p>
                )}
                
                <div className="space-y-2">
                  {job.employer.companySize && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {job.employer.companySize} employees
                    </div>
                  )}
                  
                  {job.employer.website && (
                    <div className="flex items-center text-sm">
                      <a 
                        href={job.employer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Status */}
            <Card>
              <CardHeader>
                <CardTitle>Job Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant={job.isActive ? "default" : "secondary"}>
                    {job.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {job.isActive ? "Accepting applications" : "Not accepting applications"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
