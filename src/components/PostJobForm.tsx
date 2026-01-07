import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Upload, AlertCircle, X, Briefcase } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getJobCategories } from './SkillChips';

interface PostJobFormProps {
  language: 'en' | 'hi';
  onClose: () => void;
  onSubmit: (jobData: any) => void;
}

export const PostJobForm = ({ language, onClose, onSubmit }: PostJobFormProps) => {
  const { toast } = useToast();
  const jobCategories = getJobCategories().filter(c => c.id !== '0'); // Exclude "All"
  
  const [formData, setFormData] = useState({
    name: '',
    work: '',
    customWork: '',
    details: '',
    location: '',
    mobile: '',
    postType: 'giver' as 'giver' | 'seeker',
    isUrgent: false,
    photos: [] as File[]
  });

  const texts = {
    en: {
      title: 'Post a Job',
      postType: 'Post Type',
      jobGiver: 'Job Givers / काम देने वाले',
      jobSeeker: 'Job Seekers / काम करने वाले',
      name: 'Contact Person Name',
      work: 'Type of Work',
      customWork: 'Specify Work Type',
      details: 'Work Details',
      location: 'Location',
      mobile: 'Mobile Number',
      urgent: 'Mark as Urgent',
      photos: 'Add Photos/Videos',
      submit: 'Post Job',
      cancel: 'Cancel',
      required: 'This field is required',
      detailsPlaceholder: 'Describe the work in detail, requirements, timing, etc.',
      namePlaceholder: 'Enter contact person name',
      mobilePlaceholder: 'Enter 10-digit number',
    },
    hi: {
      title: 'काम पोस्ट करें',
      postType: 'पोस्ट का प्रकार',
      jobGiver: 'Job Givers / काम देने वाले',
      jobSeeker: 'Job Seekers / काम करने वाले',
      name: 'संपर्क व्यक्ति का नाम',
      work: 'काम का प्रकार',
      customWork: 'काम का प्रकार बताएं',
      details: 'काम का विवरण',
      location: 'स्थान',
      mobile: 'मोबाइल नंबर',
      urgent: 'तुरंत का निशान लगाएं',
      photos: 'फोटो/वीडियो जोड़ें',
      submit: 'काम पोस्ट करें',
      cancel: 'रद्द करें',
      required: 'यह फ़ील्ड आवश्यक है',
      detailsPlaceholder: 'काम का विस्तार से वर्णन करें, आवश्यकताएं, समय आदि।',
      namePlaceholder: 'संपर्क व्यक्ति का नाम दर्ज करें',
      mobilePlaceholder: '10 अंकों का नंबर दर्ज करें',
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWork = formData.work === 'Other' ? formData.customWork : formData.work;
    
    // Basic validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast({
        title: language === 'en' ? 'Name is required' : 'नाम आवश्यक है',
        variant: "destructive",
      });
      return;
    }

    if (!finalWork) {
      toast({
        title: language === 'en' ? 'Work type is required' : 'काम का प्रकार आवश्यक है',
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

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.mobile.trim())) {
      toast({
        title: language === 'en' ? 'Please enter valid 10-digit number' : 'कृपया वैध 10 अंकों का नंबर दर्ज करें',
        variant: "destructive",
      });
      return;
    }

    if (!formData.details.trim() || formData.details.trim().length < 10) {
      toast({
        title: language === 'en' ? 'Details must be at least 10 characters' : 'विवरण कम से कम 10 अक्षर होने चाहिए',
        variant: "destructive",
      });
      return;
    }
    
    const jobData = {
      ...formData,
      work: finalWork,
    };
    onSubmit(jobData);
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
                  <RadioGroupItem value="giver" id="giver" />
                  <Label htmlFor="giver" className="cursor-pointer flex-1">
                    {texts[language].jobGiver}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="seeker" id="seeker" />
                  <Label htmlFor="seeker" className="cursor-pointer flex-1">
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

            {/* Work Type */}
            <div>
              <Label htmlFor="work" className="text-sm font-medium">
                {texts[language].work} *
              </Label>
              <Select value={formData.work} onValueChange={(value) => setFormData(prev => ({ ...prev, work: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={texts[language].work} />
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

            {/* Custom Work Type */}
            {formData.work === 'Other' && (
              <div>
                <Label htmlFor="customWork" className="text-sm font-medium">
                  {texts[language].customWork} *
                </Label>
                <Input
                  id="customWork"
                  value={formData.customWork}
                  onChange={(e) => setFormData(prev => ({ ...prev, customWork: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
            )}

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

            {/* Mobile */}
            <div>
              <Label htmlFor="mobile" className="text-sm font-medium">
                {texts[language].mobile} *
              </Label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  +91
                </div>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, mobile: value }));
                  }}
                  required
                  className="pl-12"
                  placeholder={texts[language].mobilePlaceholder}
                />
              </div>
            </div>

            {/* Details */}
            <div>
              <Label htmlFor="details" className="text-sm font-medium">
                {texts[language].details} *
              </Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                required
                className="mt-1 min-h-[80px]"
                placeholder={texts[language].detailsPlaceholder}
              />
            </div>

            {/* Urgent Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="urgent" className="text-sm font-medium">
                {texts[language].urgent}
              </Label>
              <Switch
                id="urgent"
                checked={formData.isUrgent}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUrgent: checked }))}
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

            {/* Urgent Warning */}
            {formData.isUrgent && (
              <div className="flex items-center space-x-2 p-3 bg-urgent/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-urgent" />
                <span className="text-sm text-urgent">
                  {language === 'en' ? 'This job will be marked as urgent and highlighted.' : 'यह काम तुरंत के रूप में चिह्नित और हाइलाइट किया जाएगा।'}
                </span>
              </div>
            )}

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
