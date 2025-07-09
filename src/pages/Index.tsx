
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Users, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 py-20">
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Legal Analytics Platform
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
              Lawyer Performance
              <br />
              <span className="text-foreground">Analytics Hub</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Comprehensive analytics and insights for legal professionals. 
              Track performance, manage cases, and optimize your legal operations with advanced data visualization.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 text-lg font-semibold hover-lift shadow-lg group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold hover-lift glass-effect"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Analytics Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to analyze and optimize legal performance in one comprehensive platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-card hover-lift glass-effect animate-scale-in border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive performance metrics, completion rates, and detailed insights with interactive charts and visualizations.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-card hover-lift glass-effect animate-scale-in border shadow-sm" style={{animationDelay: '0.1s'}}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track lawyer performance, manage allocations, and monitor team productivity across different branches and departments.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-card hover-lift glass-effect animate-scale-in border shadow-sm" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Data Import</h3>
              <p className="text-muted-foreground leading-relaxed">
                Easy CSV upload and processing with automatic data validation, feature engineering, and seamless integration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 gradient-border animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Legal Analytics?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join the future of legal performance management with our comprehensive analytics platform.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 text-lg font-semibold hover-lift shadow-xl group"
            >
              Start Analyzing Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
