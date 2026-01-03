import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Phone, Lock, User } from 'lucide-react';
import { signUpSchema, signInSchema, type SignUpInput, type SignInInput } from '@/lib/validations';

interface AuthPageProps {
  language: 'en' | 'hi';
  onSuccess: () => void;
}

export const AuthPage = ({ language, onSuccess }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const texts = {
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter 10-digit number',
      password: 'Password',
      name: 'Full Name',
      signInTitle: 'Welcome Back',
      signUpTitle: 'Create Account',
      signInDescription: 'Sign in with your phone number',
      signUpDescription: 'Register with your phone number',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signInButton: 'Sign In',
      signUpButton: 'Create Account',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      signInSuccess: 'Signed in successfully!',
      signUpSuccess: 'Account created successfully!',
      signInError: 'Failed to sign in',
      signUpError: 'Failed to create account',
      phoneError: 'Please enter a valid 10-digit phone number',
      passwordError: 'Password must be at least 6 characters',
      nameError: 'Please enter your full name',
      phoneExists: 'This phone number is already registered',
      invalidCredentials: 'Invalid phone number or password',
    },
    hi: {
      signIn: 'साइन इन करें',
      signUp: 'साइन अप करें',
      phone: 'फ़ोन नंबर',
      phonePlaceholder: '10 अंकों का नंबर दर्ज करें',
      password: 'पासवर्ड',
      name: 'पूरा नाम',
      signInTitle: 'वापस स्वागत है',
      signUpTitle: 'खाता बनाएं',
      signInDescription: 'अपने फ़ोन नंबर से साइन इन करें',
      signUpDescription: 'अपने फ़ोन नंबर से पंजीकरण करें',
      noAccount: 'कोई खाता नहीं है?',
      haveAccount: 'पहले से खाता है?',
      signInButton: 'साइन इन करें',
      signUpButton: 'खाता बनाएं',
      signingIn: 'साइन इन हो रहा है...',
      creatingAccount: 'खाता बनाया जा रहा है...',
      signInSuccess: 'सफलतापूर्वक साइन इन हो गए!',
      signUpSuccess: 'खाता सफलतापूर्वक बनाया गया!',
      signInError: 'साइन इन करने में विफल',
      signUpError: 'खाता बनाने में विफल',
      phoneError: 'कृपया एक वैध 10 अंकों का फ़ोन नंबर दर्ज करें',
      passwordError: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
      nameError: 'कृपया अपना पूरा नाम दर्ज करें',
      phoneExists: 'यह फ़ोन नंबर पहले से पंजीकृत है',
      invalidCredentials: 'अमान्य फ़ोन नंबर या पासवर्ड',
    }
  };

  // Convert phone to pseudo-email for Supabase auth
  const phoneToEmail = (phoneNumber: string) => `${phoneNumber}@rojgarmela.app`;

  const validateForm = () => {
    try {
      if (isSignUp) {
        const data: SignUpInput = { name: name.trim(), phone: phone.trim(), password };
        signUpSchema.parse(data);
      } else {
        const data: SignInInput = { phone: phone.trim(), password };
        signInSchema.parse(data);
      }
      return true;
    } catch (error: any) {
      const firstError = error.errors?.[0];
      if (firstError) {
        toast({
          title: firstError.message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    const cleanPhone = phone.trim();
    const pseudoEmail = phoneToEmail(cleanPhone);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: pseudoEmail,
          password,
          options: {
            data: {
              name: name.trim(),
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
            description: language === 'en' 
              ? 'You can now sign in with your phone number.' 
              : 'अब आप अपने फ़ोन नंबर से साइन इन कर सकते हैं।',
          });
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: pseudoEmail,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error(texts[language].invalidCredentials);
          }
          throw error;
        }

        if (data.session) {
          toast({
            title: texts[language].signInSuccess,
          });
          onSuccess();
        }
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? texts[language].signUpError : texts[language].signInError,
        description: error.message || (language === 'en' ? 'An error occurred. Please try again.' : 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? texts[language].signUpTitle : texts[language].signInTitle}
          </CardTitle>
          <CardDescription>
            {isSignUp ? texts[language].signUpDescription : texts[language].signInDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{texts[language].name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={texts[language].name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}
            
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{texts[language].password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={texts[language].password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? texts[language].creatingAccount : texts[language].signingIn)
                : (isSignUp ? texts[language].signUpButton : texts[language].signInButton)
              }
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? texts[language].haveAccount : texts[language].noAccount}
            </span>{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword('');
              }}
            >
              {isSignUp ? texts[language].signIn : texts[language].signUp}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
