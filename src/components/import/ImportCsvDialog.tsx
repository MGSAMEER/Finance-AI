"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download } from "lucide-react";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { uid } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Category, TxType } from "@/lib/types";

interface CsvRow {
  [key: string]: string;
}

interface ColumnMapping {
  amount: string;
  category: string;
  date: string;
  note: string;
  type: string;
}

const SAMPLE_CSV = `amount,category,date,note,type
50000,Other,2025-08-01,Salary,income
1200,Food,2025-08-02,Lunch,expense
2500,Groceries,2025-08-03,Weekly groceries,expense
3000,Travel,2025-08-04,Cab fare,expense
15000,Rent,2025-08-01,Monthly rent,expense
800,Bills,2025-08-05,Electricity bill,expense
2000,Shopping,2025-08-06,Clothing,expense
1500,Health,2025-08-07,Pharmacy,expense
1200,Entertainment,2025-08-08,Movie tickets,expense
5000,Other,2025-08-10,Freelance work,income`;

export function ImportCsvDialog() {
  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    amount: "", category: "", date: "", note: "", type: ""
  });
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "CSV Parse Error",
            description: `Found ${results.errors.length} parsing errors.`,
            variant: "destructive",
          });
          return;
        }
        setCsvData(results.data as CsvRow[]);
        
        // Auto-map columns
        const headers = Object.keys(results.data[0] || {});
        const autoMapping: ColumnMapping = { amount: "", category: "", date: "", note: "", type: "" };
        
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes("amount")) autoMapping.amount = header;
          if (lowerHeader.includes("category")) autoMapping.category = header;
          if (lowerHeader.includes("date")) autoMapping.date = header;
          if (lowerHeader.includes("note")) autoMapping.note = header;
          if (lowerHeader.includes("type")) autoMapping.type = header;
        });
        
        setMapping(autoMapping);
      },
    });
  }, [toast]);

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finance-import-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!csvData.length) return;
    setIsImporting(true);
    
    try {
      const validCategories: Category[] = ["Food", "Travel", "Rent", "Shopping", "Bills", "Health", "Entertainment", "Groceries", "Other"];
      const validTypes: TxType[] = ["income", "expense"];
      
      const transactions = csvData
        .map((row, index) => {
          const amount = parseFloat(row[mapping.amount]);
          const category = row[mapping.category] as Category;
          const type = row[mapping.type] as TxType;
          const dateStr = row[mapping.date];
          
          // Validate amount
          if (isNaN(amount) || amount <= 0) {
            throw new Error(`Row ${index + 1}: Invalid amount "${row[mapping.amount]}"`);
          }
          
          // Validate category
          if (!validCategories.includes(category)) {
            throw new Error(`Row ${index + 1}: Invalid category "${category}". Valid categories: ${validCategories.join(", ")}`);
          }
          
          // Validate type
          if (!validTypes.includes(type)) {
            throw new Error(`Row ${index + 1}: Invalid type "${type}". Valid types: ${validTypes.join(", ")}`);
          }
          
          // Validate and format date
          let formattedDate: string;
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              throw new Error(`Row ${index + 1}: Invalid date "${dateStr}". Use YYYY-MM-DD format`);
            }
            formattedDate = date.toISOString();
          } catch {
            throw new Error(`Row ${index + 1}: Invalid date "${dateStr}". Use YYYY-MM-DD format`);
          }
          
          return {
            id: uid(),
            amount,
            category,
            date: formattedDate,
            note: row[mapping.note] || undefined,
            type,
          };
        });

      await db.transactions.bulkAdd(transactions);
      
      toast({
        title: "Import Successful",
        description: `Imported ${transactions.length} transactions successfully`,
      });
      
      setOpen(false);
      setCsvData([]);
      
      // Refresh the page to update dashboard
      window.location.reload();
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import transactions",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const hasValidMapping = Object.values(mapping).every(v => v);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your transaction data and map the columns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button variant="outline" onClick={downloadSample} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Template
              </Button>
            </div>
          </div>

          {csvData.length > 0 && (
            <div className="space-y-4">
              <Label>Column Mapping</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount Column</Label>
                  <Select value={mapping.amount} onValueChange={(value) => setMapping(prev => ({ ...prev, amount: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select amount column" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(csvData[0] || {}).map((col) => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category Column</Label>
                  <Select value={mapping.category} onValueChange={(value) => setMapping(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category column" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(csvData[0] || {}).map((col) => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Column</Label>
                  <Select value={mapping.date} onValueChange={(value) => setMapping(prev => ({ ...prev, date: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date column" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(csvData[0] || {}).map((col) => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type Column</Label>
                  <Select value={mapping.type} onValueChange={(value) => setMapping(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type column" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(csvData[0] || {}).map((col) => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note Column (Optional)</Label>
                  <Select value={mapping.note} onValueChange={(value) => setMapping(prev => ({ ...prev, note: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select note column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No note column</SelectItem>
                      {Object.keys(csvData[0] || {}).map((col) => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {csvData.length > 0 && hasValidMapping && (
            <>
              <div className="space-y-2">
                <Label>Preview (First 5 rows)</Label>
                <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">₹{parseFloat(row[mapping.amount]).toLocaleString()}</td>
                          <td className="p-2">{row[mapping.category]}</td>
                          <td className="p-2">{row[mapping.date]}</td>
                          <td className="p-2">{row[mapping.type]}</td>
                          <td className="p-2">{row[mapping.note] || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ... and {csvData.length - 5} more rows
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? "Importing..." : `Import ${csvData.length} Transactions`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
