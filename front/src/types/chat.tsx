export class ChatMessage {
  id: number;
  message_id: number;
  type: string;
  name: string;
  content: string;
  previous_id?: number;
  next_ids?: number[];

  constructor(data: Partial<ChatMessage>) {
    this.id = data.id || 0;
    this.message_id = data.message_id || 0;
    this.type = data.type || "";
    this.name = data.name || "name";
    this.content = data.content || "";
    this.previous_id = data.previous_id;
    this.next_ids = data.next_ids;
  }
}

export class ChatHistoryMemory {
  current_id: number;
  memory_list: ChatMessage[];
  id_map: { [id: number]: number };

  constructor() {
    this.current_id = 0;
    this.memory_list = [];
    this.id_map = {};
  }

  addMessage(message: ChatMessage) {
    if (this.id_map[message.message_id] === undefined) {
      this.memory_list.push(message);
      this.id_map[message.message_id] = this.memory_list.length - 1;
    } else {
      if (message.type === "generating") {
        this.memory_list[this.id_map[message.message_id]].content +=
          message.content;
      } else {
        this.memory_list[this.id_map[message.message_id]] = message;
      }
    }
    return this;
  }
  getMessage(id: number) {
    return this.memory_list[this.id_map[id]];
  }
  getMessages() {
    return this.memory_list;
  }
  clear() {
    this.memory_list = [];
    this.id_map = {};
  }
}

export class ChatConversation {
  id: number;
  name: string;
  created_at: string;

  constructor(data: Partial<ChatConversation>) {
    this.id = data.id || 0;
    this.name = data.name || "";
    this.created_at = data.created_at || "";
  }
}
