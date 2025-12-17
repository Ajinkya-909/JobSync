import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, Building2, Users, TrendingUp, 
  Search, CheckCircle2, Zap, Shield, 
  ArrowRight, Star, Target, Globe,
  Sparkles, BarChart3, Heart, Moon, Sun
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">JobSync</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/jobs">
              <Button variant="ghost">Browse Jobs</Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleToggleTheme}>
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="w-full md:w-[40%] space-y-6">
            <Badge className="w-fit" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Your Career Journey Starts Here
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Connect Talent with
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Opportunity
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              JobSync brings together exceptional talent and forward-thinking companies. 
              Find your perfect match and build the future together.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/jobs">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Explore Jobs
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="gap-2">
                  <Building2 className="h-5 w-5" />
                  For Employers
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">1000+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">500+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Companies</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">10K+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Job Seekers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">95%</div>
                <div className="text-xs md:text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Hero Image */}
          <div className="w-full md:w-[60%] relative">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <img 
                src="/hero_image.png" 
                alt="Professional team collaboration" 
                className="w-full h-full object-fill"
              />
            </div>
            {/* Floating cards for visual interest */}
            <div className="absolute -top-6 -left-6 bg-background border rounded-lg p-4 shadow-lg hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">10K+</div>
                  <div className="text-xs text-muted-foreground">Job Seekers</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-background border rounded-lg p-4 shadow-lg hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">500+</div>
                  <div className="text-xs text-muted-foreground">Companies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Star className="h-3 w-3 mr-1" />
            Features
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Why Choose JobSync?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed to make hiring and job searching seamless, efficient, and successful.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription>
                AI-powered algorithm matches candidates with jobs based on skills, experience, and preferences.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Verified Companies</CardTitle>
              <CardDescription>
                All businesses are thoroughly verified by our admin team to ensure legitimacy and quality.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Get instant notifications about application status, new job matches, and interview schedules.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Easy Application</CardTitle>
              <CardDescription>
                Apply to multiple jobs with one click using your saved profile and automatically matched skills.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Businesses get detailed insights on applications, candidate quality, and hiring metrics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Fresher Friendly</CardTitle>
              <CardDescription>
                Special focus on entry-level positions and companies that welcome fresh graduates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-20">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Globe className="h-3 w-3 mr-1" />
            Process
          </Badge>
          <h2 className="text-4xl font-bold mb-4">How JobSync Works</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* For Job Seekers */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold">For Job Seekers</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Create Your Profile</h4>
                  <p className="text-muted-foreground text-sm">
                    Sign up and build your professional profile with skills, experience, and resume.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Browse & Apply</h4>
                  <p className="text-muted-foreground text-sm">
                    Explore jobs or let our AI match you with perfect opportunities. Apply with one click.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Track Applications</h4>
                  <p className="text-muted-foreground text-sm">
                    Monitor your application status in real-time and get notified of updates.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Land Your Dream Job</h4>
                  <p className="text-muted-foreground text-sm">
                    Connect with hiring managers and start your new career journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* For Employers */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold">For Employers</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Register & Get Verified</h4>
                  <p className="text-muted-foreground text-sm">
                    Sign up with your company details and get verified by our admin team.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Post Job Openings</h4>
                  <p className="text-muted-foreground text-sm">
                    Create detailed job listings with requirements, benefits, and company culture.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Review Applications</h4>
                  <p className="text-muted-foreground text-sm">
                    Get matched candidates with eligibility scores and filter by your criteria.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Hire Top Talent</h4>
                  <p className="text-muted-foreground text-sm">
                    Connect with the best candidates and grow your team efficiently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-16">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers and companies who trust JobSync for their hiring needs.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                Sign Up Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                View All Jobs
                <Search className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">JobSync</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Connecting talent with opportunity, one match at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Create Profile</Link></li>
                <li><Link to="/jobs" className="hover:text-foreground transition-colors">Career Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Post a Job</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Register Company</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 JobSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
