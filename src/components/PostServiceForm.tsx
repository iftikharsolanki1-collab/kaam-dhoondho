import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Upload, X, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getJobCategories } from './SkillChips';

interface PostServiceFormProps {
  language: 'en' | 'hi';
  onClose: () => void;
  onSubmit: (serviceData: any) => void;
  isSubmitting?: boolean;
}

export const PostServiceForm = ({ language, onClose, onSubmit, isSubmitting = false }: PostServiceFormProps) => {
  const { toast } = useToast();
  const jobCategories = getJobCategories().filter(c => c.id !== '0');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skill: '',
    customSkill: '',
    experience: '',
    description: '',
    location: '',
    postType: 'seeker' as 'giver' | 'seeker',
    photos: [] as File[]
  });

  const texts = {
    en: {
      title: 'Offer Your Service',
      postType: 'Post Type',
      jobGiver: 'Job Givers / काम देने वाले',
      jobSeeker: 'Job Seekers / काम करने वाले',
      name: 'Contact Person Name',
      phone: 'Mobile Number',
      skill: 'Your Skill',
      customSkill: 'Specify Skill',
      experience: 'Years of Experience',
      description: 'Description',
      location: 'Your Location',
      photos: 'Add Photos/Videos',
      submit: 'Post Service',
      cancel: 'Cancel',
      descriptionPlaceholder: 'Describe your experience, skills, and what services you provide...',
      namePlaceholder: 'Enter contact person name',
      mobilePlaceholder: 'Enter 10-digit number',
    },
    hi: {
      title: 'अपनी सेवा पेश करें',
      postType: 'पोस्ट का प्रकार',
      jobGiver: 'Job Givers / काम देने वाले',
      jobSeeker: 'Job Seekers / काम करने वाले',
      name: 'संपर्क व्यक्ति का नाम',
      phone: 'मोबाइल नंबर',
      skill: 'आपका कौशल',
      customSkill: 'कौशल बताएं',
      experience: 'अनुभव के वर्ष',
      description: 'विवरण',
      location: 'आपका स्थान',
      photos: 'फोटो/वीडियो जोड़ें',
      submit: 'सेवा पोस्ट करें',
      cancel: 'रद्द करें',
      descriptionPlaceholder: 'अपने अनुभव, कौशल और सेवाओं का वर्णन करें...',
      namePlaceholder: 'संपर्क व्यक्ति का नाम दर्ज करें',
      mobilePlaceholder: '10 अंकों का नंबर दर्ज करें',
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSkill = formData.skill === 'Other' ? formData.customSkill : formData.skill;
    
    // Basic validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast({
        title: language === 'en' ? 'Name is required' : 'नाम आवश्यक है',
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast({
        title: language === 'en' ? 'Please enter valid 10-digit number' : 'कृपया वैध 10 अंकों का नंबर दर्ज करें',
        variant: "destructive",
      });
      return;
    }

    if (!finalSkill) {
      toast({
        title: language === 'en' ? 'Skill is required' : 'कौशल आवश्यक है',
        variant: "destructive",
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: language === 'en' ? 'Location is required' : 'स्थान आवश्यक है',
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      toast({
        title: language === 'en' ? 'Description must be at least 10 characters' : 'विवरण कम से कम 10 अक्षर होने चाहिए',
        variant: "destructive",
      });
      return;
    }
    
    const serviceData = {
      ...formData,
      skill: finalSkill,
      work: finalSkill,
      details: formData.description,
      mobile: formData.phone
    };
    onSubmit(serviceData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles].slice(0, 5)
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
            {/* Post Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-primary" />
                {texts[language].postType} *
              </Label>
              <RadioGroup
                value={formData.postType}
                onValueChange={(value: 'giver' | 'seeker') => 
                  setFormData(prev => ({ ...prev, postType: value }))
                }
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="giver" id="service-giver" />
                  <Label htmlFor="service-giver" className="cursor-pointer flex-1">
                    {texts[language].jobGiver}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="seeker" id="service-seeker" />
                  <Label htmlFor="service-seeker" className="cursor-pointer flex-1">
                    {texts[language].jobSeeker}
                  </Label>
                </div>
              </RadioGroup>
            </div>

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
                placeholder={texts[language].namePlaceholder}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                {texts[language].phone} *
              </Label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, phone: value }));
                  }}
                  required
                  className="pl-12"
                  placeholder={texts[language].mobilePlaceholder}
                />
              </div>
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
                  {jobCategories.map((category) => (
                    <SelectItem key={category.id} value={category.en}>
                      {language === 'hi' ? category.hi : category.en}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">
                    {language === 'hi' ? 'अन्य' : 'Other'}
                  </SelectItem>
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
                  id="service-file-upload"
                />
                <Label
                  htmlFor="service-file-upload"
                  className="flex items-center justify-center w-full h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">Upload files</span>
                </Label>
              </div>
              
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
