import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeForm } from "@/components/forms/IncomeForm";

export default function AddIncomePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Income</h1>
          <p className="text-muted-foreground">
            Record your income sources and track your earnings.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Form</CardTitle>
          <CardDescription>
            Enter the details of your income transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeForm />
        </CardContent>
      </Card>
    </div>
  );
}
