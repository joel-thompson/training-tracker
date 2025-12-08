import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import type { TestType } from "shared/types";
import { greet } from "shared/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

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
    <div>
      <Button onClick={() => void refetch()}>Test Requestss</Button>

      <h1>{testData.message}</h1>
      <p>Timestamp: {testData.timestamp}</p>

      {testRequestData && (
        <div>
          <h2>Test Request Data</h2>
          <p>Message: {testRequestData.message}</p>
          <p>Timestamp: {testRequestData.timestamp}</p>
        </div>
      )}
    </div>
  );
}
