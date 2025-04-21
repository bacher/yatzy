import { RequestInfo } from "@redwoodjs/sdk/worker";
import { Board } from "@/app/components/Board";

export const Home = ({ ctx }: RequestInfo) => (
  <div>
    <Board />
  </div>
);
