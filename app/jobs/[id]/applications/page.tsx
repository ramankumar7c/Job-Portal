"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, Calendar, Mail, MapPin, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Applicant {
  id: string;
  name?: string | null;
  email: string;
  location?: string | null;
  skills?: string[];
  resumeUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
}

interface ApplicationItem {
  id: string;
  status: string;
  createdAt: string;
  applicant: Applicant;
  coverLetter?: string | null;
}

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    fetchApplications();
  }, [session, status, jobId]);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to load applications");
      }
    } catch (e) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, status: string) => {
    try {
      setUpdatingId(applicationId);
      const res = await fetch(`/api/applications/${applicationId}` , {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: updated.status } : a)));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/jobs/${jobId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Job
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          </div>
          <div>
            <Badge variant="secondary">{applications.length} total</Badge>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-4 text-red-700">{error}</CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-600">Loading applications...</div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">You will see applications here once candidates apply to this job.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{(app.applicant.name || app.applicant.email).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{app.applicant.name || "Unnamed"}</h3>
                          <Badge variant="outline">{app.status}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center"><Mail className="h-4 w-4 mr-1" />{app.applicant.email}</span>
                          {app.applicant.location && (
                            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{app.applicant.location}</span>
                          )}
                          {app.applicant.phone && (
                            <span className="flex items-center"><User className="h-4 w-4 mr-1" />{app.applicant.phone}</span>
                          )}
                          <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                        {app.applicant.bio && (
                          <p className="mt-2 text-sm text-gray-700">{app.applicant.bio}</p>
                        )}
                        {app.applicant.skills && app.applicant.skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">Skills:</span>
                            {app.applicant.skills.slice(0, 6).map((s, i) => (
                              <Badge key={i} variant="secondary">{s}</Badge>
                            ))}
                          </div>
                        )}
                        {app.coverLetter && (
                          <div className="mt-3 text-sm">
                            <span className="font-medium text-gray-900">Cover letter:</span>
                            <p className="text-gray-700 whitespace-pre-wrap mt-1">{app.coverLetter}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.applicant.resumeUrl && (
                        <a href={app.applicant.resumeUrl} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm">View Resume</Button>
                        </a>
                      )}
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        disabled={!!updatingId}
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEWED">Interviewed</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="ACCEPTED">Accepted</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


