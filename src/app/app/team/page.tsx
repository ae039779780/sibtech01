import { inviteTeamAction } from "@/app/actions/customer";
import { Button, DemoNote, Field, PageHeader } from "@/components/ui";
import { actorCan, roleLabel } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireSession();
  if (!actorCan(session, "smb.invite")) {
    redirect("/app");
  }
  const params = await searchParams;
  const invites = await prisma.teamInvite.findMany({
    where: { ownerUserId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        eyebrow="SMB Owner"
        title="Team"
        description="Invite Finance (pay-in/out) or Viewer (read-only). Full seats are post-demo."
      />
      <DemoNote>
        DEMO invite only — records a pending TeamInvite. Does not provision SMB Finance/Viewer logins.
      </DemoNote>
      {params.error ? <p className="mt-4 text-sm text-danger">Enter a valid email.</p> : null}
      <form action={inviteTeamAction} className="mt-6 space-y-4 rounded-[1.6rem] bg-white/[0.04] p-5">
        <Field label="Email" name="email" type="email" required placeholder="finance@company.com" />
        <Field label="Seat" name="memberRole">
          <select
            name="memberRole"
            className="w-full rounded-2xl border-0 bg-white/[0.06] px-3 py-3 text-sm"
            defaultValue="SMB_VIEWER"
          >
            <option value="SMB_VIEWER">SMB Viewer · read-only</option>
            <option value="SMB_FINANCE">SMB Finance · pay-in / payout</option>
          </select>
        </Field>
        <Button type="submit" className="h-12 w-full text-base">
          Send DEMO invite
        </Button>
      </form>
      <h2 className="mt-10 text-lg font-semibold">Pending invites</h2>
      <ul className="mt-3 space-y-2">
        {invites.length === 0 ? (
          <li className="text-sm text-muted">No invites yet.</li>
        ) : (
          invites.map((invite) => (
            <li
              key={invite.id}
              className="flex justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm"
            >
              <span>
                {invite.email}
                <span className="mt-1 block text-xs text-muted">
                  {roleLabel(invite.memberRole)} · {invite.status} · {displayDate(invite.createdAt)}
                </span>
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
