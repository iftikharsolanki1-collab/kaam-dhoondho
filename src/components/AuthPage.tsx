import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, User } from 'lucide-react';
import logoImage from '@/assets/rojgar-mela-logo-new.png';

interface AuthPageProps {
  language: 'en' | 'hi';
  onSuccess: () => void;
}

export const AuthPage = ({ language, onSuccess }: AuthPageProps) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const texts = {
    en: {
      signUp: 'Sign Up',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter 10-digit number',
      name: 'Full Name',
      namePlaceholder: 'Enter your full name',
      signUpTitle: 'Create Account',
      signUpDescription: 'Register with your name and phone number',
      signUpButton: 'Create Account',
      creatingAccount: 'Creating account...',
      signUpSuccess: 'Account created successfully!',
      signUpError: 'Failed to create account',
      phoneError: 'Please enter a valid 10-digit phone number',
      nameError: 'Please enter your full name',
      phoneExists: 'This phone number is already registered',
    },
    hi: {
      signUp: 'साइन अप करें',
      phone: 'फ़ोन नंबर',
      phonePlaceholder: '10 अंकों का नंबर दर्ज करें',
      name: 'पूरा नाम',
      namePlaceholder: 'अपना पूरा नाम दर्ज करें',
      signUpTitle: 'खाता बनाएं',
      signUpDescription: 'अपने नाम और फ़ोन नंबर से पंजीकरण करें',
      signUpButton: 'खाता बनाएं',
      creatingAccount: 'खाता बनाया जा रहा है...',
      signUpSuccess: 'खाता सफलतापूर्वक बनाया गया!',
      signUpError: 'खाता बनाने में विफल',
      phoneError: 'कृपया एक वैध 10 अंकों का फ़ोन नंबर दर्ज करें',
      nameError: 'कृपया अपना पूरा नाम दर्ज करें',
      phoneExists: 'यह फ़ोन नंबर पहले से पंजीकृत है',
    }
  };

  // Convert phone to pseudo-email for Supabase auth
  const phoneToEmail = (phoneNumber: string) => `${phoneNumber}@rojgarmela.app`;

  // Generate a random password for the user (they don't need to know it)
  const generatePassword = () => {
    return `RojgarMela@${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
  };

  const validateForm = () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast({
        title: texts[language].phoneError,
        variant: "destructive",
      });
      return false;
    }
    if (!name.trim() || name.trim().length < 2) {
      toast({
        title: texts[language].nameError,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const pseudoEmail = phoneToEmail(cleanPhone);
    const generatedPassword = generatePassword();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: pseudoEmail,
        password: generatedPassword,
        options: {
          data: {
            name: cleanName,
            phone: cleanPhone
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          throw new Error(texts[language].phoneExists);
        }
        throw error;
      }

      if (data.session) {
        toast({
          title: texts[language].signUpSuccess,
        });
        onSuccess();
      } else {
        toast({
          title: texts[language].signUpSuccess,
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: texts[language].signUpError,
        description: error.message || (language === 'en' ? 'An error occurred. Please try again.' : 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src={logoImage} 
              alt="रोज़गार मेला" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            {texts[language].signUpTitle}
          </CardTitle>
          <CardDescription>
            {texts[language].signUpDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{texts[language].name}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={texts[language].namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{texts[language].phone}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground border-r pr-2">
                  +91
                </div>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={texts[language].phonePlaceholder}
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(value);
                  }}
                  className="pl-20"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary-dark" 
              disabled={isLoading}
            >
              {isLoading ? texts[language].creatingAccount : texts[language].signUpButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};