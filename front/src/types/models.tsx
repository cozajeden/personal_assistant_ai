export class ModelFilters {
  model_name: string;
  capabilities: string;
  context_window_gte: number;
  context_window_lte: number;
  size_gte: number;
  size_lte: number;
  completion?: boolean;
  tools?: boolean;
  thinking?: boolean;
  insert?: boolean;
  embedding?: boolean;
  vision?: boolean;
  model_name_asc?: boolean | undefined;
  context_window_asc?: boolean | undefined;
  size_asc?: boolean | undefined;
  completion_asc?: boolean | undefined;
  capabilities_asc?: boolean | undefined;

  constructor() {
    this.model_name = "";
    this.capabilities = "";
    this.context_window_gte = 0;
    this.context_window_lte = 0;
    this.size_gte = 0;
    this.size_lte = 0;
    this.completion = false;
    this.tools = false;
    this.thinking = false;
    this.insert = false;
    this.embedding = false;
    this.vision = false;
    this.model_name_asc = undefined;
    this.context_window_asc = undefined;
    this.size_asc = undefined;
    this.completion_asc = undefined;
    this.capabilities_asc = undefined;
  }
}

export class Model {
  model_name: string;
  context_window: number;
  size: number;
  capabilities: string[];
  completion: boolean;
  tools: boolean;
  thinking: boolean;
  insert: boolean;
  embedding: boolean;
  vision: boolean;
  constructor(data: any) {
    this.model_name = data.model_name;
    this.context_window = data.context_window;
    this.completion = data.completion;
    this.tools = data.tools;
    this.thinking = data.thinking;
    this.insert = data.insert;
    this.embedding = data.embedding;
    this.vision = data.vision;
    this.size = data.size;
    this.capabilities = data.capabilities;
  }
  get_context_window_kb() {
    return (this.context_window / 1024).toFixed(2);
  }
  get_size_gb() {
    return (this.size / 1e9).toFixed(2);
  }
  get_capabilities() {
    return this.capabilities?.join(", ") || "";
  }
}
