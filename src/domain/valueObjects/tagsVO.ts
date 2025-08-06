export class TagValueObject {
  private readonly _value: string | null;

  private constructor(value: string | null) {
    this._value = value;
  }

  public static create(value: string | null): TagValueObject {
    if (value === null) return new TagValueObject(null);

    const trimmed = value.trim();

    if (!trimmed) throw new Error("Tags cannot be empty if provided");

    // Optional: Validation for allowed characters
    if (!/^[a-zA-Z0-9, ]+$/.test(trimmed)) {
      throw new Error("Tags can only contain alphanumeric characters, commas, and spaces");
    }

    // Optional: Normalize
    const normalized = trimmed
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .join(",");

    return new TagValueObject(normalized);
  }

  public get value(): string | null {
    return this._value;
  }

  public toString(): string {
    return this._value ?? "";
  }
}
