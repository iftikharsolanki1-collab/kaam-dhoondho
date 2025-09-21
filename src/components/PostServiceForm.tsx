import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Upload, X } from 'lucide-react';

interface PostServiceFormProps {
  language: 'en' | 'hi';
  onClose: () => void;
  onSubmit: (serviceData: any) => void;
}

const skills = [
  'Plumber', 'Electrician', 'Mason', 'Carpenter', 'Painter', 
  'Cleaner', 'Driver', 'Cook', 'Guard', 'Gardener', 'Other'
];

export const PostServiceForm = ({ language, onClose, onSubmit }: PostServiceFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skill: '',
    customSkill: '',
    experience: '',
    description: '',
    location: '',
    rate: '',
    rateType: 'daily',
    photos: [] as File[]
  });

  const texts = {
    en: {
      title: 'Offer Your Service',
      name: 'Your Name',
      phone: 'Phone Number',
      skill: 'Your Skill',
      customSkill: 'Specify Skill',
      experience: 'Years of Experience',
      description: 'Description',
      location: 'Your Location',
      rate: 'Your Rate',
      daily: 'Per Day',
      hourly: 'Per Hour',
      monthly: 'Per Month',
      photos: 'Add Photos/Videos',
      submit: 'Post Service',
      cancel: 'Cancel',
      required: 'This field is required',
      descriptionPlaceholder: 'Describe your experience, skills, and what services you provide...',
      ratePlaceholder: 'e.g., ₹500'
    },
    hi: {
      title: 'अपनी सेवा पेश करें',
      name: 'आपका नाम',
      phone: 'फोन नंबर',
      skill: 'आपका कौशल',
      customSkill: 'कौशल बताएं',
      experience: 'अनुभव के वर्ष',
      description: 'विवरण',
      location: 'आपका स्थान',
      rate: 'आपकी दर',
      daily: 'प्रति दिन',
      hourly: 'प्रति घंटा',
      monthly: 'प्रति महीना',
      photos: 'फोटो/वीडियो जोड़ें',
      submit: 'सेवा पोस्ट करें',
      cancel: 'रद्द करें',
      required: 'यह फ़ील्ड आवश्यक है',
      descriptionPlaceholder: 'अपने अनुभव, कौशल और सेवाओं का वर्णन करें...',
      ratePlaceholder: 'जैसे, ₹500'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSkill = formData.skill === 'Other' ? formData.customSkill : formData.skill;
    const serviceData = {
      ...formData,
      skill: finalSkill,
      work: finalSkill, // For compatibility with JobCard component
      details: formData.description,
      mobile: formData.phone,
      rateDisplay: `₹${formData.rate}/${formData.rateType === 'daily' ? (language === 'en' ? 'day' : 'दिन') : formData.rateType === 'hourly' ? (language === 'en' ? 'hour' : 'घंटा') : (language === 'en' ? 'month' : 'महीना')}`
    };
    onSubmit(serviceData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles].slice(0, 5) // Limit to 5 files
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-md shadow-lg mt-4 mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-primary">
              {texts[language].title}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                {texts[language].name} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="mt-1"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                {texts[language].phone} *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="mt-1"
                placeholder="+91 9876543210"
              />
            </div>

            {/* Skill */}
            <div>
              <Label htmlFor="skill" className="text-sm font-medium">
                {texts[language].skill} *
              </Label>
              <Select value={formData.skill} onValueChange={(value) => setFormData(prev => ({ ...prev, skill: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={texts[language].skill} />
                </SelectTrigger>
                <SelectContent>
                  {skills.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Skill */}
            {formData.skill === 'Other' && (
              <div>
                <Label htmlFor="customSkill" className="text-sm font-medium">
                  {texts[language].customSkill} *
                </Label>
                <Input
                  id="customSkill"
                  value={formData.customSkill}
                  onChange={(e) => setFormData(prev => ({ ...prev, customSkill: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
            )}

            {/* Experience */}
            <div>
              <Label htmlFor="experience" className="text-sm font-medium">
                {texts[language].experience}
              </Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="mt-1"
                placeholder="5"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                {texts[language].location} *
              </Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Rate */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="rate" className="text-sm font-medium">
                  {texts[language].rate} *
                </Label>
                <Input
                  id="rate"
                  value={formData.rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                  required
                  className="mt-1"
                  placeholder={texts[language].ratePlaceholder}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">&nbsp;</Label>
                <Select value={formData.rateType} onValueChange={(value) => setFormData(prev => ({ ...prev, rateType: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{texts[language].daily}</SelectItem>
                    <SelectItem value="hourly">{texts[language].hourly}</SelectItem>
                    <SelectItem value="monthly">{texts[language].monthly}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                {texts[language].description} *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="mt-1 min-h-[80px]"
                placeholder={texts[language].descriptionPlaceholder}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <Label className="text-sm font-medium">
                {texts[language].photos}
              </Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">Upload files</span>
                </Label>
              </div>
              
              {/* Preview uploaded files */}
              {formData.photos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.photos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                {texts[language].cancel}
              </Button>
              <Button type="submit" className="flex-1">
                {texts[language].submit}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};