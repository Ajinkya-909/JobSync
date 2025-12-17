import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Upload, FileText, X, Save } from 'lucide-react';

interface EmployeeProfile {
  full_name: string;
  phone: string;
  location: string;
  experience_years: number;
  education: string;
  skills: string[];
  resume_url: string;
}

const EmployeeProfile = () => {
  const { user, dbUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<EmployeeProfile>({
    full_name: '',
    phone: '',
    location: '',
    experience_years: 0,
    education: '',
    skills: [],
    resume_url: ''
  });
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !dbUser || dbUser.role !== 'employee') {
        navigate('/auth');
        return;
      }
    }
  }, [user, dbUser, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: employeeData, error: empError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (empError) {
          console.error('Error fetching employee:', empError);
          setIsLoading(false);
          return;
        }

        if (!employeeData) {
          setIsLoading(false);
          return;
        }
        
        setEmployeeId(employeeData.id);

        const { data: profileData, error } = await supabase
          .from('employee_profiles')
          .select('*')
          .eq('employee_id', employeeData.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
            experience_years: profileData.experience_years || 0,
            education: profileData.education || '',
            skills: profileData.skills || [],
            resume_url: profileData.resume_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (field: keyof EmployeeProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or Word document',
          variant: 'destructive'
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Resume must be less than 5MB',
          variant: 'destructive'
        });
        return;
      }
      setResumeFile(file);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile || !employeeId) return null;

    setIsUploading(true);
    try {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${employeeId}_${Date.now()}.${fileExt}`;
      const filePath = `${employeeId}/${fileName}`;

      // Delete old resume if exists
      if (profile.resume_url) {
        try {
          const oldPath = profile.resume_url.split('/').slice(-2).join('/');
          await supabase.storage.from('employee_resume').remove([oldPath]);
        } catch (err) {
          console.log('Could not delete old resume:', err);
        }
      }

      // Upload new resume
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee_resume')
        .upload(filePath, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload file');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee_resume')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload resume. Please check storage permissions.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!employeeId) return;

    if (!profile.full_name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your full name',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      let resumeUrl = profile.resume_url;

      // Upload resume if a new file was selected
      if (resumeFile) {
        const uploadedUrl = await uploadResume();
        if (uploadedUrl) {
          resumeUrl = uploadedUrl;
        }
      }

      const profileData = {
        employee_id: employeeId,
        full_name: profile.full_name,
        phone: profile.phone,
        location: profile.location,
        experience_years: profile.experience_years,
        education: profile.education,
        skills: profile.skills,
        resume_url: resumeUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('employee_profiles')
        .upsert(profileData, { onConflict: 'employee_id' });

      if (error) throw error;

      setProfile(prev => ({ ...prev, resume_url: resumeUrl }));
      setResumeFile(null);

      toast({
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">Manage your professional information</p>
        </div>
        <Button onClick={saveProfile} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Your personal and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="San Francisco, CA"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              max="50"
              value={profile.experience_years}
              onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              value={profile.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="E.g., Bachelor's in Computer Science, University of XYZ, 2020"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills
          </CardTitle>
          <CardDescription>Add your technical and professional skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill (e.g., JavaScript, Project Management)"
            />
            <Button onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume
          </CardTitle>
          <CardDescription>Upload your resume (PDF or Word document, max 5MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.resume_url && (
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Current Resume</span>
              </div>
              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  View
                </Button>
              </a>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeSelect}
              className="flex-1"
            />
            {resumeFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {resumeFile.name}
              </div>
            )}
          </div>
          {resumeFile && (
            <p className="text-sm text-muted-foreground">
              New resume will be uploaded when you save your profile
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
