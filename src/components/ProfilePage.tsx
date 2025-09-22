import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Edit, Bookmark, Calendar, Camera } from 'lucide-react';

interface ProfilePageProps {
  language: 'en' | 'hi';
}

export const ProfilePage = ({ language }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [savedJobsList, setSavedJobsList] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 9876543210',
    location: 'Delhi, India',
    joinDate: '2024-01-15',
    profilePhoto: ''
  });

  // Load saved jobs from localStorage
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobsList(savedJobs);
  }, []);

  const texts = {
    en: {
      title: 'My Profile',
      personalInfo: 'Personal Information',
      savedJobs: 'Saved Jobs',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      joinDate: 'Member Since',
      edit: 'Edit Profile',
      save: 'Save Changes',
      cancel: 'Cancel',
      noSavedJobs: 'No saved jobs yet',
      viewAll: 'View All',
      uploadPhoto: 'Upload Photo'
    },
    hi: {
      title: 'मेरी प्रोफ़ाइल',
      personalInfo: 'व्यक्तिगत जानकारी',
      savedJobs: 'सेव किए गए काम',
      name: 'नाम',
      email: 'ईमेल',
      phone: 'फोन',
      location: 'स्थान',
      joinDate: 'सदस्य बनने की तारीख',
      edit: 'प्रोफ़ाइल संपादित करें',
      save: 'बदलाव सेव करें',
      cancel: 'रद्द करें',
      noSavedJobs: 'अभी तक कोई काम सेव नहीं किया',
      viewAll: 'सभी देखें',
      uploadPhoto: 'फोटो अपलोड करें'
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, profilePhoto: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'en' 
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      : date.toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.profilePhoto} alt={profile.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {profile.name}
              </h2>
              <p className="text-muted-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {texts[language].joinDate}: {formatDate(profile.joinDate)}
              </p>
              <Button
                variant={isEditing ? "outline" : "default"}
                size="sm"
                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                {isEditing ? texts[language].cancel : texts[language].edit}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            {texts[language].personalInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{texts[language].name}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">{texts[language].email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">{texts[language].phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location">{texts[language].location}</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <Button onClick={handleSave} className="w-full">
                {texts[language].save}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{profile.name}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{profile.email}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{profile.phone}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{profile.location}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Jobs */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bookmark className="w-5 h-5 mr-2 text-primary" />
              {texts[language].savedJobs}
            </CardTitle>
            {savedJobsList.length > 0 && (
              <Button variant="outline" size="sm">
                {texts[language].viewAll}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {savedJobsList.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {texts[language].noSavedJobs}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedJobsList.map((job, index) => (
                <div key={job.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-foreground">{job.name}</h4>
                        {job.isUrgent && (
                          <Badge variant="destructive" className="bg-urgent text-urgent-foreground text-xs">
                            🔴
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-primary">{job.work}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.location} • {job.rate}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                  {index < savedJobsList.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};