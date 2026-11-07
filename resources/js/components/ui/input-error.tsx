import { XOctagonIcon } from "lucide-react";

export default function InputError({
    message,
    id,
    className = "",
}: {
    message: string;
    id?: string;
    className?: string;
}) {
    return (
        <p id={id} className={`text-red-500 pl-3 text-xs ${className}`}>
            {message}
        </p>
    );
}
