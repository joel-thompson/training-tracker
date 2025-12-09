import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import type { TestType } from "shared/types";
import { greet } from "shared/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const { getToken } = useAuth();

  const { data: testRequestData, refetch } = useQuery({
    queryKey: ["testRequest"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch("/api", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json() as Promise<TestType>;
    },
    enabled: false,
  });

  const testData: TestType = {
    message: greet("Frontend"),
    timestamp: 1,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {testData.message}
          </CardTitle>
          <CardDescription>Timestamp: {testData.timestamp}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => void refetch()}>Test Request</Button>
        </CardContent>
      </Card>

      {testRequestData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Test Request Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Message:</span>{" "}
              {testRequestData.message}
            </p>
            <p className="text-sm">
              <span className="font-medium">Timestamp:</span>{" "}
              {testRequestData.timestamp}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
