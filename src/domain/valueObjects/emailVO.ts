// src/domain/valueobject/EmailVO.ts

export class EmailVO {
  private readonly _value: string;

  private constructor(email: string) {
    this._value = email;
  }

  get value(): string {
    return this._value;
  }

  static create(email: string): EmailVO {
    if (!email.trim()) throw new Error("Email is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("Invalid email format");

    return new EmailVO(email);
  }
}
