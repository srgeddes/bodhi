import { apiClient } from "@/lib/api-client";

import { useAuthStore } from "@/store/auth.store";

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  ApiClientError: class extends Error {
    constructor(
      message: string,
      public status: number
    ) {
      super(message);
      this.name = "ApiClientError";
    }
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
};

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe("login", () => {
    it("sets user and isAuthenticated on success", async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { user: mockUser, token: "jwt-token" },
      });

      await useAuthStore.getState().login("test@example.com", "password123");

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("sets error on failure", async () => {
      const { ApiClientError } = jest.requireMock("@/lib/api-client");
      mockedApiClient.post.mockRejectedValueOnce(
        new ApiClientError("Invalid credentials", 401)
      );

      await expect(
        useAuthStore.getState().login("bad@example.com", "wrong")
      ).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.error).toBe("Invalid credentials");
      expect(state.isLoading).toBe(false);
    });
  });

  describe("register", () => {
    it("sets user and isAuthenticated on success", async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { user: mockUser, token: "jwt-token" },
      });

      await useAuthStore.getState().register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user!.email).toBe("test@example.com");
    });
  });

  describe("logout", () => {
    it("triggers navigation to logout endpoint", async () => {
      useAuthStore.setState({
        user: { id: "1", email: "a@b.com", name: null },
        isAuthenticated: true,
      });

      // jsdom throws "Not implemented: navigation" when setting window.location.href.
      // Capture the error to verify logout attempted to navigate.
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      await useAuthStore.getState().logout();

      // jsdom logs a "Not implemented: navigation" error when href is set
      expect(consoleSpy).toHaveBeenCalled();
      const navError = consoleSpy.mock.calls.find((c) =>
        String(c[0]).includes("Not implemented: navigation")
      );
      expect(navError).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe("setUser", () => {
    it("sets user and isAuthenticated", () => {
      useAuthStore.getState().setUser({ id: "1", email: "a@b.com", name: "A" });
      const state = useAuthStore.getState();
      expect(state.user).toBeDefined();
      expect(state.isAuthenticated).toBe(true);
    });

    it("sets isAuthenticated to false for null user", () => {
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("clearError", () => {
    it("sets error to null", () => {
      useAuthStore.setState({ error: "some error" });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
