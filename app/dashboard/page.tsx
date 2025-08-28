"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  Calendar,
  MapPin,
  DollarSign
} from "lucide-react";
import Link from "next/link";

interface JobApplication {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
  };
  applicant?: {
    id: string;
    name?: string | null;
    email: string;
    location?: string | null;
    resumeUrl?: string | null;
  };
}

interface JobListing {
  id: string;
  title: string;
  location: string;
  type: string;
  salary?: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    applications: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalViews: 0,
  });
  const [employerApplications, setEmployerApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      if (session?.user?.role === "JOB_SEEKER") {
        const [applicationsRes, statsRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/applications/stats")
        ]);
        
        if (applicationsRes.ok) {
          const data = await applicationsRes.json();
          setApplications(data.applications);
        }
        
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } else if (session?.user?.role === "EMPLOYER") {
        const [jobsRes, statsRes, employerAppsRes] = await Promise.all([
          fetch("/api/jobs/my-jobs"),
          fetch("/api/jobs/stats"),
          fetch("/api/applications/employer")
        ]);
        
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          setJobListings(data.jobs);
        }
        
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        if (employerAppsRes.ok) {
          const data = await employerAppsRes.json();
          setEmployerApplications(data.applications || []);
          setStats((s) => ({ ...s, totalApplications: data.applications?.length || s.totalApplications }));
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isJobSeeker = session.user.role === "JOB_SEEKER";
  const isEmployer = session.user.role === "EMPLOYER";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name || session.user.email}!
          </h1>
          <p className="text-gray-600">
            {isJobSeeker 
              ? "Track your job applications and discover new opportunities"
              : "Manage your job postings and review applications"
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isJobSeeker ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all jobs
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    Under review
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.shortlistedApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    Moving forward
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalApplications > 0 
                      ? Math.round((stats.shortlistedApplications / stats.totalApplications) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shortlist rate
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    Posted jobs
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all jobs
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    Job post views
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue={isJobSeeker ? "applications" : "jobs"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            {isJobSeeker ? (
              <>
                <TabsTrigger value="applications">My Applications</TabsTrigger>
                <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="jobs">My Jobs</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </>
            )}
          </TabsList>

          {isJobSeeker ? (
            <>
              <TabsContent value="applications" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Applications</h2>
                  <Link href="/applications">
                    <Button variant="outline">View All</Button>
                  </Link>
                </div>
                
                {applications.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600 mb-4">
                        Start applying to jobs to see your applications here
                      </p>
                      <Link href="/jobs">
                        <Button>Browse Jobs</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application) => (
                      <Card key={application.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {application.job.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  {application.job.company}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {application.job.location}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(application.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                application.status === "APPLIED" ? "secondary" :
                                application.status === "SHORTLISTED" ? "default" :
                                application.status === "REJECTED" ? "destructive" :
                                "outline"
                              }>
                                {application.status}
                              </Badge>
                              <Link href={`/jobs/${application.job.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4">
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                    <p className="text-gray-600 mb-4">
                      Save interesting jobs to review them later
                    </p>
                    <Link href="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="jobs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Job Postings</h2>
                  <Link href="/jobs/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </Link>
                </div>
                
                {jobListings.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                      <p className="text-gray-600 mb-4">
                        Start posting jobs to find the perfect candidates
                      </p>
                      <Link href="/jobs/new">
                        <Button>Post Your First Job</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {jobListings.map((job) => (
                      <Card key={job.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {job.title}
                                </h3>
                                <Badge variant={job.isActive ? "default" : "secondary"}>
                                  {job.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {job.location}
                                </span>
                                <span className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  {job.type}
                                </span>
                                {job.salary && (
                                  <span className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {job.salary}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {job._count.applications} applications
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link href={`/jobs/${job.id}/edit`}>
                                <Button variant="outline" size="sm">Edit</Button>
                              </Link>
                              <Link href={`/jobs/${job.id}/applications`}>
                                <Button size="sm">View Applications</Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Applications</h2>
                  <Link href="/applications">
                    <Button variant="outline">View All</Button>
                  </Link>
                </div>
                {employerApplications.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600 mb-4">
                        Applications will appear here once candidates start applying to your jobs
                      </p>
                      <Link href="/jobs/new">
                        <Button>Post a Job</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {employerApplications.slice(0, 5).map((app) => (
                      <Card key={app.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {app.job.title}
                              </h3>
                              <div className="mt-1 text-sm text-gray-600">
                                {app.applicant?.name || app.applicant?.email}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{app.status}</Badge>
                              <Link href={`/jobs/${app.job.id}/applications`}>
                                <Button size="sm" variant="outline">Manage</Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
