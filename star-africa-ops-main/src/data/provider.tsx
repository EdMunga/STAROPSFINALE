import { useState, type ReactNode } from "react";
import { RepositoryContext } from "./context";
import { createMockRepository } from "./repository";
import type { OperationsRepository } from "./types";

export function OperationsProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: OperationsRepository;
}) {
  const [mock] = useState(() => createMockRepository());
  return (
    <RepositoryContext.Provider value={repository ?? mock}>{children}</RepositoryContext.Provider>
  );
}
