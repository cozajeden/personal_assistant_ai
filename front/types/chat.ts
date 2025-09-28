export class ChatMessage {
    id: number;
    type: string;
    content: string;
    previous_id?: number;
    next_ids?: number[];

    constructor(data: Partial<ChatMessage>) {
        this.id = data.id || 0;
        this.type = data.type || '';
        this.content = data.content || '';
        this.previous_id = data.previous_id;
        this.next_ids = data.next_ids;
    }
}

export interface ChatMemory {
    [id: number]: ChatMessage;
}


export class ChatHistoryMemory {
    memory: ChatMemory;
    current_id: number;
    constructor() {
        this.memory = {};
        this.current_id = 0;
    }
    addMessage(message: ChatMessage) {
        console.log('message', message);
        if (this.current_id !== 0 && this.current_id === message.id) {
            if (message.type === 'generating') {
                this.memory[message.id].content += message.content;
            } else {
                this.memory[message.id] = message;
            }
        } else {
            const previous_id = this.current_id;
            message.previous_id = this.current_id;
            message.next_ids = [];
            this.current_id = message.id;
            this.memory[message.id] = message;
        }
        return this;
    }
    getMessage(id: number) {
        return this.memory[id];
    }
    getMessages() {
        return Object.values(this.memory);
    }
}
