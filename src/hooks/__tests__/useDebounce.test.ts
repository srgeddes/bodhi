import { renderHook, act } from "@testing-library/react";

import { useDebounce } from "@/hooks/useDebounce";

jest.useFakeTimers();

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello"));
    expect(result.current).toBe("hello");
  });

  it("updates after delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "hello" } }
    );

    rerender({ value: "world" });
    // Before timer fires
    expect(result.current).toBe("hello");

    // After timer fires
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("world");
  });

  it("resets timer on rapid value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ value: "c" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ value: "d" });

    // Should still be original since timer kept resetting
    expect(result.current).toBe("a");

    // Now let final timer fire
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("d");
  });

  it("uses default 300ms delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });
});
