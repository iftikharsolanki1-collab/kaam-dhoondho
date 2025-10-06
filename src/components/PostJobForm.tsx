import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Upload, AlertCircle, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PostJobFormProps {
  language: 'en' | 'hi';
  onClose: () => void;
  onSubmit: (jobData: any) => void;
}

const skills = [
  'Plumber', 'Mason', 'Painter', 'Electrician', 'Driver', 'Helper',
  'Carpenter', 'Welder', 'Cook', 'Mechanic', 'Tailor', 'Gardener',
  'Cleaner', 'Security Guard', 'Delivery', 'AC Technician', 'Beautician',
  'Barber', 'Laundry', 'Tutor', 'Nurse', 'Caretaker', 'Construction',
  'Tiles Work', 'Furniture', 'Pest Control', 'Packers & Movers',
  'Event Staff', 'Photography', 'Computer Repair', 'Mobile Repair',
  'Sales', 'Office Work', 'Other'
];

export const PostJobForm = ({ language, onClose, onSubmit }: PostJobFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    work: '',
    customWork: '',
    details: '',
    location: '',
    mobile: '',
    rate: '',
    rateType: 'daily',
    isUrgent: false,
    photos: [] as File[]
  });

  const texts = {
    en: {
      title: 'Post a Job',
      name: 'Your Name',
      work: 'Type of Work',
      customWork: 'Specify Work Type',
      details: 'Work Details',
      location: 'Location',
      mobile: 'Mobile Number',
      rate: 'Rate',
      daily: 'Per Day',
      hourly: 'Per Hour',
      monthly: 'Per Month',
      urgent: 'Mark as Urgent',
      photos: 'Add Photos/Videos',
      submit: 'Post Job',
      cancel: 'Cancel',
      required: 'This field is required',
      detailsPlaceholder: 'Describe the work in detail, requirements, timing, etc.',
      ratePlaceholder: 'e.g., ₹500'
    },
    hi: {
      title: 'काम पोस्ट करें',
      name: 'आपका नाम',
      work: 'काम का प्रकार',
      customWork: 'काम का प्रकार बताएं',
      details: 'काम का विवरण',
      location: 'स्थान',
      mobile: 'मोबाइल नंबर',
      rate: 'दर',
      daily: 'प्रति दिन',
      hourly: 'प्रति घंटा',
      monthly: 'प्रति महीना',
      urgent: 'तुरंत का निशान लगाएं',
      photos: 'फोटो/वीडियो जोड़ें',
      submit: 'काम पोस्ट करें',
      cancel: 'रद्द करें',
      required: 'यह फ़ील्ड आवश्यक है',
      detailsPlaceholder: 'काम का विस्तार से वर्णन करें, आवश्यकताएं, समय आदि।',
      ratePlaceholder: 'जैसे, ₹500'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWork = formData.work === 'Other' ? formData.customWork : formData.work;
    const jobData = {
      ...formData,
      work: finalWork,
      rateDisplay: `₹${formData.rate}/${formData.rateType === 'daily' ? (language === 'en' ? 'day' : 'दिन') : formData.rateType === 'hourly' ? (language === 'en' ? 'hour' : 'घंटा') : (language === 'en' ? 'month' : 'महीना')}`
    };
    onSubmit(jobData);
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
                  {skills.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
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
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                required
                className="mt-1"
                placeholder="+91 9876543210"
              />
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