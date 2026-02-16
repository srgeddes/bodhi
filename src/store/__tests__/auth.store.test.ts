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
  emailVerified: true,
  mfaEnabled: false,
};

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      mfaPending: false,
      mfaTempToken: null,
      verificationRequired: false,
      verificationEmail: null,
    });
    jest.clearAllMocks();
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.mfaPending).toBe(false);
    expect(state.mfaTempToken).toBeNull();
  });

  describe("login", () => {
    it("sets user and isAuthenticated on authenticated status", async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { status: "authenticated", user: mockUser },
      });

      const status = await useAuthStore.getState().login("test@example.com", "password123");

      const state = useAuthStore.getState();
      expect(status).toBe("authenticated");
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("sets mfaPending on mfa_required status", async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { status: "mfa_required", user: { ...mockUser, mfaEnabled: true }, tempToken: "mfa-jwt" },
      });

      const status = await useAuthStore.getState().login("test@example.com", "password123");

      const state = useAuthStore.getState();
      expect(status).toBe("mfa_required");
      expect(state.mfaPending).toBe(true);
      expect(state.mfaTempToken).toBe("mfa-jwt");
      expect(state.isAuthenticated).toBe(false);
    });

    it("sets verificationRequired on verification_required status", async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { status: "verification_required", user: { ...mockUser, emailVerified: false } },
      });

      const status = await useAuthStore.getState().login("test@example.com", "password123");

      const state = useAuthStore.getState();
      expect(status).toBe("verification_required");
      expect(state.verificationRequired).toBe(true);
      expect(state.verificationEmail).toBe("test@example.com");
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
    it("sets verificationRequired on verification_required status", async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { status: "verification_required", user: { ...mockUser, emailVerified: false } },
      });

      const status = await useAuthStore.getState().register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const state = useAuthStore.getState();
      expect(status).toBe("verification_required");
      expect(state.verificationRequired).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("verifyMfa", () => {
    it("authenticates on valid MFA code", async () => {
      // Set up MFA pending state
      useAuthStore.setState({ mfaPending: true, mfaTempToken: "mfa-jwt" });

      mockedApiClient.post.mockResolvedValueOnce({
        data: { status: "authenticated", user: mockUser },
      });

      await useAuthStore.getState().verifyMfa("123456");

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.mfaPending).toBe(false);
      expect(state.mfaTempToken).toBeNull();
    });
  });

  describe("logout", () => {
    it("triggers navigation to logout endpoint", async () => {
      useAuthStore.setState({
        user: { id: "1", email: "a@b.com", name: null, emailVerified: true, mfaEnabled: false },
        isAuthenticated: true,
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      await useAuthStore.getState().logout();

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
      useAuthStore.getState().setUser({ id: "1", email: "a@b.com", name: "A", emailVerified: true, mfaEnabled: false });
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
