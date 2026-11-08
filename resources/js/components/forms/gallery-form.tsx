import { upload } from '@/actions/Modules/Gallery/Http/Controllers/GalleryController';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { File as FileIcon, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
    onUploadSuccess?: () => void;
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

export default function GalleryForm({ onUploadSuccess }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const { data, setData, post, processing, progress, errors, reset } =
        useForm<{ files: File[] }>({ files: [] });

    const fileError = useMemo(
        () =>
            Object.entries(errors).find(
                ([field]) => field === 'files' || field.startsWith('files.'),
            )?.[1],
        [errors],
    );

    function addFiles(selectedFiles: FileList | File[]) {
        const files = Array.from(selectedFiles);

        if (files.length > 0) {
            setData('files', [...data.files, ...files]);
        }

        setFileInputKey((key) => key + 1);
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post(upload.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setFileInputKey((key) => key + 1);
                onUploadSuccess?.();
            },
        });
    }

    return (
        <Card>
            <CardContent>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-semibold">Upload files</h2>
                        <p className="text-sm text-muted-foreground">
                            Select up to 10 files, up to 50 MB each. All file
                            types are supported.
                        </p>
                    </div>

                    <div
                        onDragEnter={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={(event) => {
                            if (
                                !event.currentTarget.contains(
                                    event.relatedTarget as Node | null,
                                )
                            ) {
                                setIsDragging(false);
                            }
                        }}
                        onDrop={(event) => {
                            event.preventDefault();
                            setIsDragging(false);
                            addFiles(event.dataTransfer.files);
                        }}
                        className={`rounded-xl border border-dashed p-6 text-center transition-colors ${
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-muted/40'
                        }`}
                    >
                        <input
                            key={fileInputKey}
                            id="gallery-files"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={(event) => {
                                if (event.currentTarget.files) {
                                    addFiles(event.currentTarget.files);
                                }
                            }}
                        />
                        <Label
                            htmlFor="gallery-files"
                            className="mx-auto flex max-w-lg cursor-pointer flex-col items-center gap-2"
                        >
                            <span className="flex size-11 items-center justify-center rounded-full bg-muted">
                                <Upload className="size-5 text-muted-foreground" />
                            </span>
                            <span className="font-medium">
                                Drop files here or browse
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Active files are public. Deleting a file moves
                                it out of public storage until restored.
                            </span>
                        </Label>
                    </div>
                    {fileError && <InputError message={fileError} />}

                    {data.files.length > 0 && (
                        <ul className="divide-y rounded-lg border">
                            {data.files.map((file, fileIndex) => (
                                <li
                                    key={`${file.name}-${file.size}-${file.lastModified}-${fileIndex}`}
                                    className="flex min-w-0 items-center gap-3 p-3"
                                >
                                    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                                    <span className="min-w-0 flex-1 truncate text-sm">
                                        {file.name}
                                    </span>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Remove ${file.name}`}
                                        disabled={processing}
                                        onClick={() =>
                                            setData(
                                                'files',
                                                data.files.filter(
                                                    (_, index) =>
                                                        index !== fileIndex,
                                                ),
                                            )
                                        }
                                    >
                                        <X />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {progress && (
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Uploading</span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <progress
                                className="h-2 w-full accent-primary"
                                value={progress.percentage}
                                max="100"
                                aria-label="Upload progress"
                            />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing || data.files.length === 0}
                        >
                            <Upload />
                            {processing
                                ? 'Uploading...'
                                : `Upload ${data.files.length || ''} ${data.files.length === 1 ? 'file' : 'files'}`}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
