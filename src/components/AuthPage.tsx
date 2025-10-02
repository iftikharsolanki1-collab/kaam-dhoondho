import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { signUpSchema, signInSchema, type SignUpInput, type SignInInput } from '@/lib/validations';

interface AuthPageProps {
  language: 'en' | 'hi';
  onSuccess: () => void;
}

export const AuthPage = ({ language, onSuccess }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const texts = {
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      signInTitle: 'Welcome Back',
      signUpTitle: 'Create Account',
      signInDescription: 'Sign in to your account to continue',
      signUpDescription: 'Create a new account to get started',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signInButton: 'Sign In',
      signUpButton: 'Create Account',
      forgotPassword: 'Forgot Password?',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      signInSuccess: 'Signed in successfully!',
      signUpSuccess: 'Account created successfully!',
      signInError: 'Failed to sign in',
      signUpError: 'Failed to create account',
      emailError: 'Please enter a valid email',
      passwordError: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      nameError: 'Please enter your full name',
    },
    hi: {
      signIn: 'साइन इन करें',
      signUp: 'साइन अप करें',
      email: 'ईमेल',
      password: 'पासवर्ड',
      name: 'पूरा नाम',
      signInTitle: 'वापस स्वागत है',
      signUpTitle: 'खाता बनाएं',
      signInDescription: 'जारी रखने के लिए अपने खाते में साइन इन करें',
      signUpDescription: 'शुरू करने के लिए एक नया खाता बनाएं',
      noAccount: 'कोई खाता नहीं है?',
      haveAccount: 'पहले से खाता है?',
      signInButton: 'साइन इन करें',
      signUpButton: 'खाता बनाएं',
      forgotPassword: 'पासवर्ड भूल गए?',
      signingIn: 'साइन इन हो रहा है...',
      creatingAccount: 'खाता बनाया जा रहा है...',
      signInSuccess: 'सफलतापूर्वक साइन इन हो गए!',
      signUpSuccess: 'खाता सफलतापूर्वक बनाया गया!',
      signInError: 'साइन इन करने में विफल',
      signUpError: 'खाता बनाने में विफल',
      emailError: 'कृपया एक वैध ईमेल दर्ज करें',
      passwordError: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए जिसमें बड़े अक्षर, छोटे अक्षर और संख्या हो',
      nameError: 'कृपया अपना पूरा नाम दर्ज करें',
    }
  };

  const validateForm = () => {
    try {
      if (isSignUp) {
        const data: SignUpInput = { name: name.trim(), email: email.trim().toLowerCase(), password };
        signUpSchema.parse(data);
      } else {
        const data: SignInInput = { email: email.trim().toLowerCase(), password };
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

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              name: name.trim()
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        // Check if email confirmation is required
        if (data?.user && !data.session) {
          toast({
            title: texts[language].signUpSuccess,
            description: language === 'en' 
              ? 'Please check your email to verify your account before signing in.' 
              : 'साइन इन करने से पहले अपना खाता सत्यापित करने के लिए कृपया अपना ईमेल जांचें।',
          });
        } else {
          toast({
            title: texts[language].signUpSuccess,
            description: language === 'en' 
              ? 'Account created successfully! You can now sign in.' 
              : 'खाता सफलतापूर्वक बनाया गया! अब आप साइन इन कर सकते हैं।',
          });
        }
        
        // Switch to sign in mode after successful signup
        setIsSignUp(false);
        setPassword('');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          // Provide helpful error messages
          if (error.message.includes('Email not confirmed')) {
            throw new Error(
              language === 'en' 
                ? 'Please verify your email before signing in. Check your inbox for the verification link.' 
                : 'साइन इन करने से पहले कृपया अपना ईमेल सत्यापित करें। सत्यापन लिंक के लिए अपना इनबॉक्स जांचें।'
            );
          } else if (error.message.includes('Invalid login credentials')) {
            throw new Error(
              language === 'en' 
                ? 'Invalid email or password. Please try again.' 
                : 'अमान्य ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।'
            );
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
      console.error('Auth error:', error);
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
                <Input
                  type="text"
                  placeholder={texts[language].name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{texts[language].email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={texts[language].email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
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

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? texts[language].haveAccount : texts[language].noAccount}
            </span>{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? texts[language].signIn : texts[language].signUp}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};