"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Save,
  Plus,
  X,
  Briefcase,
  Calendar,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  companyName: z.string().optional(),
  companyBio: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

type ProfileData = z.infer<typeof profileSchema>;

interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

  const selectedRole = watch("companyName") ? "EMPLOYER" : "JOB_SEEKER";

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchProfile();
    if (session.user.role === "JOB_SEEKER") {
      fetchExperiences();
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setValue("name", data.name || "");
        setValue("phone", data.phone || "");
        setValue("location", data.location || "");
        setValue("bio", data.bio || "");
        setValue("skills", data.skills || []);
        setValue("companyName", data.companyName || "");
        setValue("companyBio", data.companyBio || "");
        setValue("companySize", data.companySize || "");
        setValue("website", data.website || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchExperiences = async () => {
    try {
      const response = await fetch("/api/profile/experiences");
      if (response.ok) {
        const data = await response.json();
        setExperiences(data.experiences);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
    }
  };

  const onSubmit = async (data: ProfileData) => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        await update(); // Update session
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addExperience = async (experience: Omit<Experience, "id">) => {
    try {
      const response = await fetch("/api/profile/experiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(experience),
      });

      if (response.ok) {
        const newExperience = await response.json();
        setExperiences([...experiences, newExperience]);
        setShowExperienceForm(false);
        toast.success("Experience added successfully!");
      }
    } catch (error) {
      toast.error("Failed to add experience");
    }
  };

  const updateExperience = async (id: string, experience: Partial<Experience>) => {
    try {
      const response = await fetch(`/api/profile/experiences/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(experience),
      });

      if (response.ok) {
        const updatedExperience = await response.json();
        setExperiences(experiences.map(exp => 
          exp.id === id ? updatedExperience : exp
        ));
        setEditingExperience(null);
        toast.success("Experience updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update experience");
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      const response = await fetch(`/api/profile/experiences/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setExperiences(experiences.filter(exp => exp.id !== id));
        toast.success("Experience deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete experience");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    {...register("phone")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State, Country"
                  {...register("location")}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  {...register("bio")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          {isJobSeeker && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {watch("skills")?.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            const currentSkills = watch("skills") || [];
                            setValue("skills", currentSkills.filter((_, i) => i !== index));
                          }}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="Add a skill"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const skill = input.value.trim();
                          if (skill) {
                            const currentSkills = watch("skills") || [];
                            setValue("skills", [...currentSkills, skill]);
                            input.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a skill"]') as HTMLInputElement;
                        const skill = input.value.trim();
                        if (skill) {
                          const currentSkills = watch("skills") || [];
                          setValue("skills", [...currentSkills, skill]);
                          input.value = "";
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Experience Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Work Experience</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExperienceForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {experiences.map((experience) => (
                      <ExperienceCard
                        key={experience.id}
                        experience={experience}
                        onEdit={setEditingExperience}
                        onUpdate={updateExperience}
                        onDelete={deleteExperience}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isEmployer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name"
                      {...register("companyName")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select onValueChange={(value) => setValue("companySize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyBio">Company Bio</Label>
                  <Textarea
                    id="companyBio"
                    placeholder="Tell us about your company..."
                    rows={4}
                    {...register("companyBio")}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    {...register("website")}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Experience Form Modal */}
        {showExperienceForm && (
          <ExperienceForm
            onSave={addExperience}
            onCancel={() => setShowExperienceForm(false)}
          />
        )}

        {/* Edit Experience Form Modal */}
        {editingExperience && (
          <ExperienceForm
            experience={editingExperience}
            onSave={(experience) => updateExperience(editingExperience.id, experience)}
            onCancel={() => setEditingExperience(null)}
          />
        )}
      </div>
    </div>
  );
}

interface ExperienceFormProps {
  experience?: Experience;
  onSave: (experience: Omit<Experience, "id">) => void;
  onCancel: () => void;
}

function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const [formData, setFormData] = useState({
    title: experience?.title || "",
    company: experience?.company || "",
    location: experience?.location || "",
    description: experience?.description || "",
    startDate: experience?.startDate || "",
    endDate: experience?.endDate || "",
    isCurrent: experience?.isCurrent || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {experience ? "Edit Experience" : "Add Experience"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Job Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          <div>
            <Label>Company *</Label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g., Tech Corp"
              required
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your role and responsibilities..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.isCurrent}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isCurrent">I currently work here</Label>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {experience ? "Update" : "Add"} Experience
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ExperienceCardProps {
  experience: Experience;
  onEdit: (experience: Experience) => void;
  onUpdate: (id: string, experience: Partial<Experience>) => void;
  onDelete: (id: string) => void;
}

function ExperienceCard({ experience, onEdit, onDelete }: ExperienceCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{experience.title}</h4>
            <p className="text-gray-600">{experience.company}</p>
            {experience.location && (
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {experience.location}
              </p>
            )}
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(experience.startDate).toLocaleDateString()} - 
              {experience.isCurrent ? "Present" : experience.endDate ? new Date(experience.endDate).toLocaleDateString() : ""}
            </p>
            {experience.description && (
              <p className="text-sm text-gray-600 mt-2">{experience.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(experience)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(experience.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
