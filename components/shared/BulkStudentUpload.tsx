'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { bulkCreateStudents } from '@/lib/actions/student.actions';
import * as XLSX from 'xlsx';

interface BulkStudentUploadProps {
    schoolContext?: {
        id: string;
        name: string;
        city: string;
        state: string;
    };
    onComplete?: () => void;
}

export function BulkStudentUpload({ schoolContext, onComplete }: BulkStudentUploadProps) {
    const [open, setOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<{ success: any[], errors: any[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadDemoSheet = () => {
        const headers = [
            'name',
            'email',
            'password',
            'schoolName',
            'grade',
            'phone',
            'city',
            'state',
            'parentName',
            'parentPhone',
            'parentEmail'
        ];
        const data = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                grade: '10',
                phone: '1234567890',
                city: 'Bhopal',
                state: 'Madhya Pradesh',
                parentName: 'Jane Doe',
                parentPhone: '0987654321',
                parentEmail: 'jane@example.com'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(data, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "bulk-student-template.xlsx");
        toast.info("Template downloaded");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setResults(null);

        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);

                    if (data.length === 0) {
                        toast.error("The file is empty");
                        setIsUploading(false);
                        return;
                    }

                    // Basic validation
                    const firstRow = data[0] as any;
                    if (!firstRow.name || !firstRow.email) {
                        toast.error("Missing required columns: name and email");
                        setIsUploading(false);
                        return;
                    }

                    // Sanitize data to ensure only plain objects are passed to Server Action
                    const sanitizedData = data.map((item: any) => {
                        const cleanItem: any = {};
                        Object.keys(item).forEach(key => {
                            // Only include primitive values or plain objects
                            const val = item[key];
                            if (typeof val !== 'function' && typeof val !== 'symbol') {
                                cleanItem[key] = val;
                            }
                        });
                        return cleanItem;
                    });

                    const response = await bulkCreateStudents(sanitizedData, schoolContext);
                    setResults(response);

                    if (response.success.length > 0) {
                        toast.success(`Successfully enrolled ${response.success.length} students`);
                        onComplete?.();
                    }
                    if (response.errors.length > 0) {
                        toast.warning(`${response.errors.length} students failed to enroll`);
                    }
                } catch (err: any) {
                    toast.error("Failed to parse file: " + err.message);
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsBinaryString(file);
        } catch (error: any) {
            toast.error("Upload failed: " + error.message);
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/5 text-primary">
                    <Upload className="h-4 w-4" /> Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Bulk Student Enrollment</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file to enroll multiple students at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Step 1: Download Template */}
                    <div className="flex items-start gap-4 p-4 rounded-xl border bg-muted/30">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Download className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">Step 1: Get the Template</h4>
                            <p className="text-xs text-muted-foreground mt-1">Download our Excel template to ensure your data is formatted correctly.</p>
                            <Button variant="link" className="p-0 h-auto text-blue-600 text-xs mt-2" onClick={downloadDemoSheet}>
                                Download Demo Sheet.xlsx
                            </Button>
                        </div>
                    </div>

                    {/* Step 2: Upload File */}
                    <div className="flex items-start gap-4 p-4 rounded-xl border bg-muted/30">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">Step 2: Upload Students</h4>
                            <p className="text-xs text-muted-foreground mt-1">Select your completed Excel file to start the bulk enrollment process.</p>

                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />

                            <Button
                                className="w-full mt-4 gap-2"
                                disabled={isUploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                {isUploading ? 'Processing File...' : 'Select File & Upload'}
                            </Button>
                        </div>
                    </div>

                    {/* Result Summary */}
                    {results && (
                        <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" /> Enrollment Summary
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-xs font-boldUppercase">Success</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700 mt-1">{results.success.length}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase">Errors</span>
                                    </div>
                                    <p className="text-2xl font-bold text-red-700 mt-1">{results.errors.length}</p>
                                </div>
                            </div>

                            {results.errors.length > 0 && (
                                <div className="max-h-[150px] overflow-y-auto p-3 rounded-lg border bg-muted/20 text-[11px] space-y-1">
                                    <p className="font-semibold border-b pb-1 mb-1">Error Details:</p>
                                    {results.errors.map((err, i) => (
                                        <div key={i} className="flex justify-between items-start text-red-600">
                                            <span>{err.email}</span>
                                            <span className="text-right ml-2 italic">{err.error}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.success.length > 0 && results.errors.length === 0 && (
                                <div className="p-3 rounded-lg bg-green-50 text-green-700 text-xs text-center border border-green-200">
                                    All students enrolled successfully with account credentials.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
