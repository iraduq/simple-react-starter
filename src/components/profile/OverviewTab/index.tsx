import { useMemo, useState } from "react";
import type { SessionUser } from "../../../lib/auth";
import type { Booking, TabKey } from "../../../types/profile";
import LoyaltyCard, { type LoyaltyAccountData } from "../../loyalty/LoyaltyCard";
import RoomFolioCard from "../../upsell/RoomFolioCard";
import MaintenanceReportModal from "../../maintenance/MaintenanceReportModal";
import GuestFeedbackModal from "../../reviews/GuestFeedbackModal";
import NextStayCard from "./NextStayCard";
import OverviewQuickSummary from "./OverviewQuickSummary";

interface OverviewTabProps {
  user: NonNullable<SessionUser>;
  bookings: Booking[];
  goToTab: (t: TabKey) => void;
  onLoyaltyChange: (acc: LoyaltyAccountData | null) => void;
}

export default function OverviewTab({
  user,
  bookings,
  goToTab,
  onLoyaltyChange,
}: OverviewTabProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const next = useMemo(() => {
    return (
      bookings
        .filter(
          (b) =>
            b.status !== "cancelled" &&
            b.status !== "completed" &&
            new Date(b.check_out) >= new Date()
        )
        .sort((a, b) => +new Date(a.check_in) - +new Date(b.check_in))[0] || null
    );
  }, [bookings]);

  const stayDays = useMemo(() => {
    if (!next) return [];
    const out: Date[] = [];
    const cur = new Date(next.check_in);
    const end = new Date(next.check_out);
    while (cur <= end && out.length < 7) {
      out.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [next]);

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email.split("@")[0];

  return (
    <div className="flex flex-col gap-6">
      <NextStayCard
        next={next}
        stayDays={stayDays}
        goToTab={goToTab}
        onOpenFeedback={() => setFeedbackModalOpen(true)}
        onOpenMaintenance={() => setMaintenanceModalOpen(true)}
      />

      <LoyaltyCard
        bookings={bookings.map((b) => ({
          id: b.id,
          booking_code: b.booking_code,
          check_in: b.check_in,
          check_out: b.check_out,
          status: b.status,
          room_title: b.room?.title,
        }))}
        onAccountChange={onLoyaltyChange}
      />

      {next && (
        <RoomFolioCard
          bookingId={String(next.id)}
          bookingCode={next.booking_code || String(next.id)}
          nightsCount={Math.max(1, stayDays.length - 1)}
          adultsCount={2}
        />
      )}

      <OverviewQuickSummary
        user={user}
        fullName={fullName}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={() => setNotificationsEnabled((v) => !v)}
        goToTab={goToTab}
      />

      <MaintenanceReportModal
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        bookingCode={next?.booking_code}
        unitNumber={next?.unit_number}
        defaultGuestName={fullName}
      />

      <GuestFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        roomId={next?.room && (next.room as any).id ? String((next.room as any).id) : undefined}
        roomTitle={next?.room?.title}
        bookingCode={next?.booking_code}
        unitNumber={next?.unit_number}
        defaultGuestName={fullName}
      />
    </div>
  );
}
