import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Form, Link } from "@inertiajs/react";
import { Spinner } from "@/components/ui/spinner";
import InputError from "@/components/ui/input-error";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Sign In to Your Dashboard</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form action="/login" method="post">
                        {({ errors, processing }) => (
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email Address
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="admin@example.com"
                                        tabIndex={1}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </Field>

                                <Field>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-muted-foreground hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        tabIndex={2}
                                        required
                                    />
                                    <InputError message={errors.password} />

                                    <div className="flex gap-2 items-center mt-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                        />
                                        <label
                                            htmlFor="remember"
                                            className="text-sm text-muted-foreground cursor-pointer"
                                        >
                                            Remember this device
                                        </label>
                                    </div>
                                </Field>

                                <Field>
                                    <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md mb-4">
                                        Protected by security rate limiting. Too
                                        many failed attempts will temporarily
                                        lock your IP address.
                                    </div>
                                </Field>

                                <Field>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner /> Authenticating...
                                            </>
                                        ) : (
                                            "Proceed to Dashboard"
                                        )}
                                    </Button>
                                </Field>
                            </FieldGroup>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
