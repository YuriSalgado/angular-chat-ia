import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Message {
  sender: 'Human' | 'AI';
  text: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewChecked {
  messages: Message[] = [];
  userMessage: string = '';
  isTyping = false;

  modelSelected: 'gpt' | 'gemini' | 'anthropic' = 'gpt';

  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const trimmedMessage = this.userMessage.trim();
    if (!trimmedMessage) return;

    // Adiciona mensagem do usuário na lista
    this.messages.push({ sender: 'Human', text: trimmedMessage });

    // Limpa input e ativa o indicador de "digitando"
    this.userMessage = '';
    this.isTyping = true;

    this.callSelectedModel(trimmedMessage);
  }

  private callSelectedModel(message: string): void {
    switch (this.modelSelected) {
      case 'gpt':
        this.callOpenAI(message);
        break;
      case 'gemini':
        this.callGemini(message);
        break;
      case 'anthropic':
        this.callAnthropic(message);
        break;
      default:
        this.handleUnsupportedModel();
    }
  }

  private async callOpenAI(message: string): Promise<void> {
    const OPENAI_API_KEY = 'sua-chave-aqui'; // NEVER commit your API key in public repositories and NEVER frontend code should contain API keys!
    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Você é um assistente útil.' },
              { role: 'user', content: message },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content?.trim() ?? 'Sem resposta.';

      this.addBotMessage(reply);
    } catch (error) {
      console.error('Erro ao consultar OpenAI:', error);
      this.addBotMessage('Erro ao consultar GPT.');
    } finally {
      this.isTyping = false;
    }
  }

  // Simulação Gemini — substituir pela chamada real
  private callGemini(message: string): void {
    setTimeout(() => {
      this.addBotMessage(`Resposta simulada do Gemini para: "${message}"`);
      this.isTyping = false;
    }, 1500);
  }

  // Simulação Anthropic — substituir pela chamada real
  private callAnthropic(message: string): void {
    setTimeout(() => {
      this.addBotMessage(`Resposta simulada do Anthropic para: "${message}"`);
      this.isTyping = false;
    }, 1500);
  }

  private handleUnsupportedModel(): void {
    this.isTyping = false;
    this.addBotMessage('Modelo não suportado.');
  }

  private addBotMessage(text: string): void {
    this.messages.push({ sender: 'AI', text });
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Erro ao rolar para o final:', err);
    }
  }
}
