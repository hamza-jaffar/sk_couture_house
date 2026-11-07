import { XOctagonIcon } from "lucide-react";

export default function InputError({ message, className = '' }: { message: string; className?: string; }) {
    return <p className={`text-red-500 pl-3 text-xs ${className}`}>{message}</p>;
}
