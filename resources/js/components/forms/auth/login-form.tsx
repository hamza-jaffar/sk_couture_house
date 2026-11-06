import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Form } from "@inertiajs/react";
import { Spinner } from "@/components/ui/spinner";
import InputError from "@/components/ui/input-error";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
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
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="m@example.com"
                                        // required
                                    />
                                    <InputError message={errors.email} />
                                </Field>
                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </Field>
                                <Field>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? (
                                            <>
                                                <Spinner /> Login...
                                            </>
                                        ) : (
                                            "Login"
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
