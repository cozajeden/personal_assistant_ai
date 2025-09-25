export interface ChatMessage {
    id: number;
    type: string;
    streaming: boolean;
    content: string;
    previous_id?: number;
    next_ids?: number[];
}

export interface ChatMemory {
    [id: number]: ChatMessage;
}


export class ChatHistory {
    memory: ChatMemory;
    current_id: number;
    constructor() {
        this.memory = {};
        this.current_id = 0;
    }
    addMessage(message: ChatMessage) {
        const previous_id = this.current_id;
        message.previous_id = this.current_id;
        message.next_ids = [];
        this.current_id = message.id;
        this.memory[message.id] = message;
    }
    getMessage(id: number) {
        return this.memory[id];
    }
}