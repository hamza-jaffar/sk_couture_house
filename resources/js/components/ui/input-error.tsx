import { XOctagonIcon } from "lucide-react";

export default function InputError({ message }: { message: string }) {
    return <p className="text-red-500 pl-3 text-xs">{message}</p>;
}
