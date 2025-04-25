import { RequestInfo } from "@redwoodjs/sdk/worker";
import { Router } from "@/app/components/Router";

export const Home = ({ ctx }: RequestInfo) => (
  <div>
    <Router />
  </div>
);
