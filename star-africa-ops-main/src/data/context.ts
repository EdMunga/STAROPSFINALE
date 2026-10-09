import { createContext, useContext } from "react";
import type { OperationsRepository } from "./types";
export const RepositoryContext = createContext<OperationsRepository | null>(null);
export function useRepository() {
  const value = useContext(RepositoryContext);
  if (!value) throw new Error("OperationsProvider is missing");
  return value;
}
