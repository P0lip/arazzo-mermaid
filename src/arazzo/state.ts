import type { ArazzoSpecification } from "./objects/document.js";

export class Identifiers {
  readonly #identifiers: Map<number, number> = new Map();
  #charOffset = 0x41;

  public readonly endIdentifier = "END";

  public generateIdentifier(): string {
    const count = this.#identifiers.get(this.#charOffset) ?? 0;
    this.#identifiers.set(this.#charOffset, count);
    const char = String.fromCharCode(this.#charOffset++);

    if (this.#charOffset === 0x5a) {
      this.#charOffset = 0x41;
    }

    if (count === 0) {
      return `${char}`;
    }

    return `${char}${count}`;
  }
}

export class State {
  readonly identifiers = new Identifiers();
  readonly allDocuments: Record<string, ArazzoSpecification> = {};
}
