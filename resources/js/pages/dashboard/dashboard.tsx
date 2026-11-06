import LogoutButton from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Form } from "@inertiajs/react";

const Dashboard = () => {
    return (
        <div>
            <LogoutButton />

            <Form method="POST" action="/toast">
                <Button type="submit">Show Toast</Button>
            </Form>
        </div>
    );
};

export default Dashboard;
