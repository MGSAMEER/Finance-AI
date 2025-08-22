import { describe, it, expect } from "vitest";
import { expenseInputSchema, incomeInputSchema } from "@/lib/schemas";

describe("schemas", () => {
  it("parses valid expense", () => {
    const parsed = expenseInputSchema.parse({
      type: "expense",
      amount: "123.45",
      category: "Food",
      date: new Date().toISOString(),
      note: "Lunch",
    });
    expect(parsed.amount).toBe(123.45);
  });

  it("rejects negative amount", () => {
    expect(() =>
      expenseInputSchema.parse({
        type: "expense",
        amount: "-5",
        category: "Food",
        date: new Date().toISOString(),
      })
    ).toThrow();
  });

  it("parses valid income", () => {
    const parsed = incomeInputSchema.parse({
      type: "income",
      amount: 10,
      category: "Other",
      date: new Date().toISOString(),
    });
    expect(parsed.amount).toBe(10);
  });
});
