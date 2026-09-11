"use client";

import { useActionState } from "react";
import { bookSessionAction, cancelBookingAction, type FormActionState } from "@/actions/bookings";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: FormActionState = {};

export function BookButton({ sessionId, disabled }: { sessionId: string; disabled?: boolean }) {
  const [state, formAction] = useActionState(bookSessionAction, initialState);
  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="sessionId" value={sessionId} />
      <SubmitButton pendingText="Booking…" disabled={disabled} className="w-full">
        Book this session
      </SubmitButton>
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

export function CancelButton({
  bookingId,
  label = "Cancel",
}: {
  bookingId: string;
  label?: string;
}) {
  const [state, formAction] = useActionState(cancelBookingAction, initialState);
  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="bookingId" value={bookingId} />
      <SubmitButton pendingText="Cancelling…" variant="outline">
        {label}
      </SubmitButton>
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
