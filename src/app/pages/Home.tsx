import { RequestInfo } from "rwsdk/worker";
import { Router } from "@/app/components/Router";

export const Home = ({ ctx }: RequestInfo) => (
  <div>
    <Router />
  </div>
);
