import { Button } from "@/components/ui/button";

const LogoutButton = () => {
    return (
        <form method="POST" action="/logout">
            <Button type="submit">Logout</Button>
        </form>
    );
};

export default LogoutButton;
