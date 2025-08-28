import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    level: string;
    salary?: string;
    description: string;
    createdAt: string;
    employer?: {
      name?: string;
      companyName?: string;
    };
    _count?: {
      applications: number;
    };
  };
}

const jobTypeColors = {
  FULL_TIME: "bg-green-100 text-green-800",
  PART_TIME: "bg-blue-100 text-blue-800",
  CONTRACT: "bg-purple-100 text-purple-800",
  INTERNSHIP: "bg-orange-100 text-orange-800",
  REMOTE: "bg-indigo-100 text-indigo-800",
};

const jobLevelColors = {
  ENTRY: "bg-gray-100 text-gray-800",
  MID: "bg-yellow-100 text-yellow-800",
  SENIOR: "bg-red-100 text-red-800",
  LEAD: "bg-pink-100 text-pink-800",
  EXECUTIVE: "bg-cyan-100 text-cyan-800",
};

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              <Link 
                href={`/jobs/${job.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {job.title}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Building2 className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(job.createdAt))} ago</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge 
            className={jobTypeColors[job.type as keyof typeof jobTypeColors]}
            variant="secondary"
          >
            {job.type.replace('_', ' ')}
          </Badge>
          <Badge 
            className={jobLevelColors[job.level as keyof typeof jobLevelColors]}
            variant="secondary"
          >
            {job.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-3">
          {job.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {job._count?.applications && (
              <span>{job._count.applications} applications</span>
            )}
          </div>
          <Link href={`/jobs/${job.id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}