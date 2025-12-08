import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import type { TestType } from "shared/types";
import { greet } from "shared/utils";
import { useState } from "react";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const { getToken } = useAuth();

  const [testRequestData, setTestRequestData] = useState<TestType | null>(null);

  const testData: TestType = {
    message: greet("Frontend"),
    timestamp: 1,
  };

  const testRequest = async () => {
    const token = await getToken();
    const response = await fetch("/api", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = (await response.json()) as TestType;
    setTestRequestData(data);
  };

  return (
    <div>
      <button onClick={() => void testRequest()}>Test Request</button>
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
