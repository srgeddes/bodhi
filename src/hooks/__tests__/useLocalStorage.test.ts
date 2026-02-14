import { renderHook, act } from "@testing-library/react";

import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("persists value to localStorage on update", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(window.localStorage.getItem("test-key")).toBe('"new-value"');
  });

  it("reads existing value from localStorage", async () => {
    window.localStorage.setItem("test-key", '"stored-value"');

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    // useEffect runs after render, need to wait
    await act(async () => {
      // Allow effects to run
    });

    expect(result.current[0]).toBe("stored-value");
  });

  it("handles localStorage errors gracefully", () => {
    // Mock localStorage.setItem to throw
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("Storage full");
    };

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    // Should not throw
    act(() => {
      result.current[1]("value");
    });

    expect(result.current[0]).toBe("value");

    // Restore
    window.localStorage.setItem = originalSetItem;
  });
});
