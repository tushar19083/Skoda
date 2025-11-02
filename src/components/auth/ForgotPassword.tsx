import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import logo from "@/assets/image.png";
import bgImage from "@/assets/bg.jpg";
import { toast } from 'sonner';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to send reset password email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if email exists in localStorage (app_users)
      const stored = localStorage.getItem('app_users');
      const users = stored ? JSON.parse(stored) : [];
      const userExists = users.some((user: any) => user.email === email);

      // Always show success message for security reasons (don't reveal if email exists)
      setIsSubmitted(true);
      toast.success('Reset password email sent successfully');
    } catch (err) {
      setError('Failed to send reset password email. Please try again.');
      toast.error('Failed to send reset password email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero bg-cover bg-center bg-no-repeat p-4">
      
      {/* Background with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: "blur(4px)",
        }}
      ></div>

      {/* Overlay to dim the background slightly */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative w-full max-w-md space-y-6 z-10">
        <Card className="card-elevated">
          <CardHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-center space-y-4 w-full">
                <div className="flex items-center justify-center">
                  <img src={logo} alt="Brand Logo" className="h-23 w-23 object-contain" />
                </div>
                <p className="text-black/80">Vehicle Booking Portal</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <CardTitle className="text-2xl">Forgot Password?</CardTitle>
              <CardDescription>
                {isSubmitted 
                  ? 'Check your email for password reset instructions' 
                  : 'Enter your email address and we\'ll send you a link to reset your password'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {isSubmitted ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Email Sent Successfully</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Please check your email inbox and click on the reset password link to create a new password.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      If you don't see the email, please check your spam folder.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                      setError('');
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Email
                  </Button>
                  
                  <Link to="/" className="block">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/" 
                    className="text-sm text-black/60 hover:text-black/80 underline flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

