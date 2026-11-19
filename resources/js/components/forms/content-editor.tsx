import { useAppearance } from '@/hooks/use-appearance';
import Editor from '@monaco-editor/react';
import 'jodit/es2021/jodit.min.css';
import JoditEditor from 'jodit-react';
import '../../../css/jodit.css';
import { Code2, FileCode, Maximize2, Minimize2, Type } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
    value: string;
    onChange: (value: string) => void;
    error?: string;
};

export default function ContentEditor({ value, onChange, error }: Props) {
    const [mode, setMode] = useState<'visual' | 'code'>('visual');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const joditRef = useRef(null);

    const { resolvedAppearance } = useAppearance();

    // Close fullscreen with Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const joditConfig = useMemo(
        () => ({
            readonly: false,
            placeholder: 'Enter page content here...',
            height: isFullscreen ? 'calc(100vh - 200px)' : 480,
            // Let our custom jodit.css handle theming — don't pass Jodit's own dark theme
            // as it conflicts with our CSS variable overrides.
            toolbarAdaptive: false,
            buttons: [
                'source',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                '|',
                'font',
                'fontsize',
                'paragraph',
                '|',
                'ul',
                'ol',
                '|',
                'align',
                '|',
                'link',
                'table',
                'hr',
                '|',
                'undo',
                'redo',
                '|',
                'fullsize',
            ],
            uploader: {
                insertImageAsBase64URI: true,
            },
        }),
        [isFullscreen],
    );

    return (
        <div
            className={
                isFullscreen
                    ? 'fixed inset-0 z-50 flex flex-col bg-background p-4 sm:p-6 shadow-2xl transition-all'
                    : 'space-y-2'
            }
        >
            {/* Header with Editor Mode Switcher & Tools */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                        Page Content <span className="text-destructive">*</span>
                    </span>
                    {isFullscreen && (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            Full Window Mode (Press Esc to exit)
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Editor Mode Toggle: Visual vs Code */}
                    <div className="inline-flex items-center rounded-lg border bg-muted/60 p-1 text-xs">
                        <button
                            type="button"
                            onClick={() => setMode('visual')}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                                mode === 'visual'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Type className="size-3.5" />
                            Visual (Jodit)
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('code')}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                                mode === 'code'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Code2 className="size-3.5" />
                            Code (HTML, CSS & JS)
                        </button>
                    </div>

                    {/* Full Window / Fullscreen Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title={isFullscreen ? 'Exit Full Window (Esc)' : 'Expand to Full Window'}
                        className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="size-3.5 text-muted-foreground" />
                                <span>Exit Full Window</span>
                            </>
                        ) : (
                            <>
                                <Maximize2 className="size-3.5 text-muted-foreground" />
                                <span>Full Window</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Hidden Input to ensure Inertia Form captures the content */}
            <input type="hidden" name="content" value={value} />

            {/* Editor Canvas */}
            <div
                className={`overflow-hidden rounded-md border border-input shadow-xs ${
                    isFullscreen ? 'flex-1 min-h-0 flex flex-col' : ''
                }`}
            >
                {mode === 'visual' ? (
                    <div className={isFullscreen ? 'flex-1 min-h-0 overflow-y-auto' : 'min-h-[480px]'}>
                        <JoditEditor
                            ref={joditRef}
                            value={value}
                            config={joditConfig}
                            onBlur={(newContent) => onChange(newContent)}
                            onChange={() => {}}
                        />
                    </div>
                ) : (
                    <div className={`relative flex flex-col ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
                        <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-mono text-[11px]">
                                <FileCode className="size-3.5" />
                                HTML, CSS & JavaScript &mdash; All-in-One Editor
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                                Supports &lt;style&gt; and &lt;script&gt; tags
                            </span>
                        </div>
                        <div className={isFullscreen ? 'flex-1 min-h-0' : 'h-[520px]'}>
                            <Editor
                                height={isFullscreen ? '100%' : '520px'}
                                defaultLanguage="html"
                                language="html"
                                value={value}
                                onChange={(val) => onChange(val ?? '')}
                                theme={resolvedAppearance === 'dark' ? 'vs-dark' : 'light'}
                                options={{
                                    minimap: { enabled: isFullscreen },
                                    fontSize: 13,
                                    wordWrap: 'on',
                                    formatOnPaste: true,
                                    formatOnType: true,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 2,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
        </div>
    );
}
