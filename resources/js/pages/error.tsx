import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link } from "@inertiajs/react";
import { AlertTriangle, ArrowLeft, Clock, Home, ShieldAlert, Wrench } from "lucide-react";

export default function ErrorPage({
    status,
    className,
    ...props
}: { status: number } & React.ComponentProps<"div">) {
    const title = {
        503: "Service Unavailable",
        500: "Server Error",
        404: "Page Not Found",
        403: "Access Forbidden",
        429: "Too Many Requests",
    }[status] || "An Error Occurred";

    const description = {
        503: "Sorry, we are doing some maintenance. Please check back soon.",
        500: "Whoops, something went wrong on our servers. We're working on fixing it.",
        404: "Sorry, the page you are looking for could not be found or has been moved.",
        403: "Sorry, you are forbidden from accessing this resource.",
        429: "You have sent too many requests in a given amount of time. Please slow down and try again later.",
    }[status] || "An unexpected error occurred while processing your request.";

    // Select an appropriate icon based on the status code
    const IconComponent = {
        503: Wrench,
        500: AlertTriangle,
        404: ShieldAlert,
        403: ShieldAlert,
        429: Clock,
    }[status] || AlertTriangle;

    return (
        <div className={cn("flex min-h-screen items-center justify-center p-4 bg-muted/40", className)} {...props}>
            <div className="w-full max-w-md">
                <Card className="text-center p-8! shadow-lg border-muted">
                    <CardHeader className="space-y-4 pb-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <IconComponent className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
                                Error {status}
                            </span>
                            <CardTitle className="text-2xl font-bold tracking-tight">
                                {title}
                            </CardTitle>
                        </div>
                        <CardDescription className="text-base">
                            {description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                            If you believe this is a mistake, please contact support or return home.
                        </div>
                    </CardContent>
                    <CardFooter className="flex w-full gap-3">
                        <Button
                            variant="outline"
                            className="w-1/2 flex items-center gap-2"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4" /> Go Back
                        </Button>
                        <Button className="w-1/2">
                            <Link href="/" className="flex items-center justify-center gap-2 w-full">
                                <Home className="h-4 w-4" /> Home
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
