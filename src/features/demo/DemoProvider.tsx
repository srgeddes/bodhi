"use client";

import { createContext, useContext } from "react";

const DemoContext = createContext(false);

export const useIsDemo = () => useContext(DemoContext);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  return <DemoContext.Provider value={true}>{children}</DemoContext.Provider>;
}
