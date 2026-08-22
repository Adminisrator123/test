import { StageBase, InitialData } from './types'; // Adjust based on your actual types file

type TextingMessageState = {
    messageCount: number;
};

export default class TextingModeStage implements StageBase<TextingMessageState, {}, {}> {
    private config: any;
    private messageState: TextingMessageState;

    constructor(data: InitialData<TextingMessageState, {}, {}>) {
        // If you used Option 1 (Interface), keep it as is. 
        // If you used Option 2 (Class), keep super(data).
        this.config = data.config;
        this.messageState = data.messageState || { messageCount: 0 };
    }

    beforePrompt(prompt: any) {
        const isTextingMode = prompt.userMessage.toLowerCase().includes('<texting>');

        if (isTextingMode) {
            // Remove the tag so the LLM doesn't read "<texting>" as part of the sentence
            prompt.userMessage = prompt.userMessage.replace('<texting>', '').trim();

            const vibes = {
                Casual: "Use lowercase mostly, short sentences, and natural pauses.",
                Formal: "Use complete sentences, proper punctuation, and a slightly more structured flow.",
                Hyper: "Use lots of exclamation points, emojis, and very short bursts (1-3 words each)."
            };

            prompt.system += `\n\n[Style Instruction]: The character is texting. 
            Provide a series of short messages separated by newlines. 
            Vibe: ${vibes[this.config?.vibe || 'Casual']}.`;
        }

        return prompt;
    }

    afterResponse(response: any) {
        // Check if we are in texting mode (if the system prompt contains our instruction)
        if (response.system && response.system.includes('[Style Instruction]')) {
            // Split by newline and remove empty lines
            const messages = response.text.split('\n').filter(line => line.trim() !== '');

            // Wrap each message in backticks: `message`
            response.systemMessages = messages.map(m => `\`${m.trim()}\``);
        }

        this.messageState.messageCount += (response.systemMessages?.length || 0);
        return response;
    }

    render() {
        return (
            <div style={{ padding: '10px', fontSize: '0.8rem' }}>
                📱 Texting Mode Active ({this.messageState.messageCount} total messages)
            </div>
        );
    }

    load() { return {}; }
    setState(state: any) { this.messageState = state; }
}

export const Stage = TextingModeStage;
