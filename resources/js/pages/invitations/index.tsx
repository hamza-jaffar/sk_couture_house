import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Link, Head, router } from '@inertiajs/react';

type Invitation = {
    id: number;
    name: string;
    email: string;
    fabric: string | null;
    date: string | null;
    notes: string | null;
    status: string;
    created_at: string;
};

export default function InvitationsIndex({ invitations }: { invitations: Invitation[] }) {
    const updateStatus = (id: number, status: string) => {
        router.patch(`/invitations/${id}`, { status }, {
            preserveScroll: true,
        });
    };

    const deleteInvitation = (id: number) => {
        if (confirm('Are you sure you want to delete this invitation?')) {
            router.delete(`/invitations/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Invitations" />

            <div className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <Heading
                        title="Invitations"
                        description="Manage incoming requests for aesthetic consultations."
                    />
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date Requested</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Fabric Focus</TableHead>
                                <TableHead>Preferred Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invitations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                        No invitations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invitations.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{invitation.name}</div>
                                            <div className="text-xs text-muted-foreground">{invitation.email}</div>
                                        </TableCell>
                                        <TableCell className="uppercase text-xs tracking-wider">{invitation.fabric || 'N/A'}</TableCell>
                                        <TableCell>{invitation.date ? new Date(invitation.date).toLocaleDateString() : 'Flexible'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                invitation.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                                invitation.status === 'declined' ? 'bg-red-100 text-red-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {invitation.status.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {invitation.notes && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => alert(`Notes from ${invitation.name}:\n\n${invitation.notes}`)}
                                                >
                                                    View Notes
                                                </Button>
                                            )}
                                            <select
                                                value={invitation.status}
                                                onChange={(e) => updateStatus(invitation.id, e.target.value)}
                                                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option className="bg-background text-foreground" value="pending">Pending</option>
                                                <option className="bg-background text-foreground" value="contacted">Contacted</option>
                                                <option className="bg-background text-foreground" value="completed">Completed</option>
                                                <option className="bg-background text-foreground" value="declined">Declined</option>
                                            </select>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => deleteInvitation(invitation.id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
