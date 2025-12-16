import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function HomePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Track your BJJ training sessions and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link to="/sessions/new">
            <Button className="w-full" size="lg">
              New Session
            </Button>
          </Link>
          <Link to="/history">
            <Button className="w-full" size="lg" variant="outline">
              View History
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
