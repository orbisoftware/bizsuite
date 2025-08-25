import { LitElement, html, css, CSSResult, TemplateResult, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ButtonType = 'primary' | 'secondary';

@customElement('my-button')
export class MyButton extends LitElement {
  @property({ type: String })
  label: string = 'Button';

  @property({ type: String })
  type: ButtonType = 'primary';

  static styles: CSSResult = css`
    button {
      padding: 8px 16px;
      font-weight: bold;
      cursor: pointer;
    }
    button.primary {
      background-color: #007bff;
      color: white;
    }
    button.secondary {
      background-color: #6c757d;
      color: white;
    }
  `;

  constructor() {
    super();
  }

  render(): TemplateResult {
    return html`
      <button class="${this.type}">${this.label}</button>
    `;
  }
}
