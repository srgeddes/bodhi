export interface WidgetConfig {
  type: string;
  title: string;
  config: Record<string, unknown>;
}

export interface IWidgetGenerationStrategy {
  generate(prompt: string, context: Record<string, unknown>): Promise<WidgetConfig>;
}
