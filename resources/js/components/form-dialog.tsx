import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name?: string;
    width?: string;
    height?: string;
    children?: React.ReactNode;
    processing: boolean;
    submitDisabled?: boolean;
};

const FormDialog = ({
    open,
    onOpenChange,
    name = 'Form',
    width = 'w-full max-w-lg',
    height = 'h-auto max-h-[85vh]',
    children,
    processing,
    submitDisabled = false,
}: Props) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className="absolute inset-0"
                onClick={() => !processing && onOpenChange(false)}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="form-dialog-title"
                className={`relative z-10 flex flex-col rounded-lg bg-background shadow-xl ${width} ${height}`}
            >
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2
                        id="form-dialog-title"
                        className="truncate pr-4 text-lg font-semibold text-foreground"
                    >
                        {name}
                    </h2>
                    <Button
                        onClick={() => !processing && onOpenChange(false)}
                        aria-label="Close dialog"
                        size="icon"
                        type="button"
                        variant="ghost"
                        disabled={processing}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">{children}</div>

                <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        disabled={processing}
                    >
                        Close
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing || submitDisabled}
                    >
                        {processing ? (
                            <>
                                <Spinner /> Submitting...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FormDialog;
