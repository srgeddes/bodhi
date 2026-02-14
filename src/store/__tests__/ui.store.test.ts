import { useUIStore } from "@/store/ui.store";

describe("UI Store", () => {
  beforeEach(() => {
    useUIStore.getState().closeModal();
  });

  it("has null activeModal initially", () => {
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  describe("openModal", () => {
    it("sets activeModal", () => {
      useUIStore.getState().openModal("settings");
      expect(useUIStore.getState().activeModal).toBe("settings");
    });
  });

  describe("closeModal", () => {
    it("sets activeModal to null", () => {
      useUIStore.getState().openModal("settings");
      useUIStore.getState().closeModal();
      expect(useUIStore.getState().activeModal).toBeNull();
    });
  });
});
