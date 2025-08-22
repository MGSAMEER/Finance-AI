import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "@/components/forms/ExpenseForm";

export default function AddExpensePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
          <p className="text-muted-foreground">
            Track your spending and categorize your expenses.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Form</CardTitle>
          <CardDescription>
            Enter the details of your expense transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>
    </div>
  );
}
