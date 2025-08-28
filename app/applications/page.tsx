"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  TrendingUp,
  Building2,
  Filter,
  Search
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobApplication {
  id: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
    isActive: boolean;
  };
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RECENT");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "JOB_SEEKER") {
      router.push("/dashboard");
      return;
    }

    fetchApplications();
  }, [session, status, router]);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchTerm, statusFilter, sortBy]);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "RECENT":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "OLDEST":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "COMPANY":
          return a.job.company.localeCompare(b.job.company);
        case "TITLE":
          return a.job.title.localeCompare(b.job.title);
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "secondary";
      case "REVIEWED":
        return "outline";
      case "SHORTLISTED":
        return "default";
      case "INTERVIEWED":
        return "default";
      case "REJECTED":
        return "destructive";
      case "ACCEPTED":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPLIED":
        return <Clock className="h-4 w-4" />;
      case "REVIEWED":
        return <Eye className="h-4 w-4" />;
      case "SHORTLISTED":
        return <CheckCircle className="h-4 w-4" />;
      case "INTERVIEWED":
        return <Briefcase className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "Your application has been submitted";
      case "REVIEWED":
        return "Your application has been reviewed";
      case "SHORTLISTED":
        return "You've been shortlisted for this position!";
      case "INTERVIEWED":
        return "You've been interviewed for this position";
      case "REJECTED":
        return "Unfortunately, your application was not selected";
      case "ACCEPTED":
        return "Congratulations! You've been accepted!";
      default:
        return "Application status unknown";
    }
  };

  const getStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === "APPLIED").length;
    const shortlisted = applications.filter(app => app.status === "SHORTLISTED").length;
    const interviewed = applications.filter(app => app.status === "INTERVIEWED").length;
    const rejected = applications.filter(app => app.status === "REJECTED").length;
    const accepted = applications.filter(app => app.status === "ACCEPTED").length;

    return { total, pending, shortlisted, interviewed, rejected, accepted };
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "JOB_SEEKER") {
    return null;
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track your job applications and their current status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Applied</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
              <div className="text-sm text-gray-600">Shortlisted</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.interviewed}</div>
              <div className="text-sm text-gray-600">Interviewed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                  <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECENT">Most Recent</SelectItem>
                  <SelectItem value="OLDEST">Oldest First</SelectItem>
                  <SelectItem value="COMPANY">Company Name</SelectItem>
                  <SelectItem value="TITLE">Job Title</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setSortBy("RECENT");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Applied ({stats.pending})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.shortlisted + stats.interviewed})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.accepted + stats.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {applications.length === 0 ? "No applications yet" : "No applications match your filters"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {applications.length === 0 
                      ? "Start applying to jobs to see your applications here"
                      : "Try adjusting your search terms or filters"
                    }
                  </p>
                  {applications.length === 0 && (
                    <Link href="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getStatusDescription={getStatusDescription}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredApplications.filter(app => app.status === "APPLIED").length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applied applications</h3>
                  <p className="text-gray-600">You haven't applied to any jobs yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications
                  .filter(app => app.status === "APPLIED")
                  .map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getStatusDescription={getStatusDescription}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filteredApplications.filter(app => ["SHORTLISTED", "INTERVIEWED"].includes(app.status)).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active applications</h3>
                  <p className="text-gray-600">You don't have any applications in the shortlist or interview stage yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications
                  .filter(app => ["SHORTLISTED", "INTERVIEWED"].includes(app.status))
                  .map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getStatusDescription={getStatusDescription}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredApplications.filter(app => ["ACCEPTED", "REJECTED"].includes(app.status)).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed applications</h3>
                  <p className="text-gray-600">You don't have any applications that have been accepted or rejected yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications
                  .filter(app => ["ACCEPTED", "REJECTED"].includes(app.status))
                  .map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getStatusDescription={getStatusDescription}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface ApplicationCardProps {
  application: JobApplication;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusDescription: (status: string) => string;
}

function ApplicationCard({ application, getStatusColor, getStatusIcon, getStatusDescription }: ApplicationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {application.job.title}
              </h3>
              <Badge variant={getStatusColor(application.status) as any}>
                {getStatusIcon(application.status)}
                <span className="ml-1">{application.status}</span>
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {application.job.company}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {application.job.location}
              </span>
              <span className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {application.job.type}
              </span>
              {application.job.salary && (
                <span className="flex items-center">
                  <span className="mr-1">💰</span>
                  {application.job.salary}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {getStatusDescription(application.status)}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Applied {new Date(application.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Updated {new Date(application.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Link href={`/jobs/${application.job.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Job
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
