import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import type { TestType } from "shared/types";
import { greet } from "shared/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

function App() {
  const [count, setCount] = useState(0);
  const { getToken } = useAuth();

  const testData: TestType = {
    message: greet("Frontend"),
    timestamp: 1,
  };

  const testRequest = async () => {
    const token = await getToken();
    const response = await fetch("http://localhost:3000/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = (await response.json()) as TestType;
    console.log(data);
  };

  return (
    <>
      <header>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <button onClick={() => void testRequest()}>Test Request</button>
      <h1>{testData.message}</h1>
      <p>Timestamp: {testData.timestamp}</p>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
