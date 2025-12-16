import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Target, Calendar, BarChart3 } from "lucide-react";

export function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">BJJ Training Tracker</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Capture and review your training efficiently. Log meaningful notes
            in 5-10 minutes post-class, right from your phone.
          </p>
          <div className="pt-4">
            <Link to="/sign-in">
              <Button size="lg">Sign In to Get Started</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Quick Session Logging
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Use the 3-2-1 method: capture 3 things that went well, 2 problems
              to work on, and 1 question to explore. Flexible and fast.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Training Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Set and track your current training goals. Stay focused on what
              you're working to improve and mark them complete when achieved.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Weekly Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              See your week at a glance. Review all problems, questions, and
              wins aggregated together to spot patterns in your training.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Training Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Track your training frequency, class type distribution, and
              session trends over time with simple analytics.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
