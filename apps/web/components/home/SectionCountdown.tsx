"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Clock3,
} from "lucide-react";

type Props = {
  startAt?: string | null;
  endAt?: string | null;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function SectionCountdown({
  startAt,
  endAt,
}: Props) {
  const [now, setNow] =
    useState(() =>
      Date.now()
    );

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setNow(
            Date.now()
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, []);

  const countdownState =
    useMemo(() => {
      if (!endAt) {
        return null;
      }

      const startTime =
        startAt
          ? new Date(
              startAt
            ).getTime()
          : null;

      const endTime =
        new Date(
          endAt
        ).getTime();

      if (
        Number.isNaN(
          endTime
        )
      ) {
        return null;
      }

      if (
        startTime &&
        now < startTime
      ) {
        return {
          label:
            "Starts in",
          target:
            startTime,
          ended: false,
        };
      }

      if (
        now >= endTime
      ) {
        return {
          label:
            "Sale ended",
          target:
            endTime,
          ended: true,
        };
      }

      return {
        label: "Ends in",
        target: endTime,
        ended: false,
      };
    }, [
      startAt,
      endAt,
      now,
    ]);

  if (!countdownState) {
    return null;
  }

  if (
    countdownState.ended
  ) {
    return (
      <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-extrabold text-gray-500 sm:px-4 sm:text-sm">
        <Clock3 size={16} />
        Sale ended
      </div>
    );
  }

  const difference =
    Math.max(
      countdownState.target -
        now,
      0
    );

  const timeLeft =
    calculateTimeLeft(
      difference
    );

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 px-3 py-2 shadow-sm sm:px-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
        <Clock3 size={15} />
      </div>

      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-wide text-red-500 sm:text-[10px]">
          {
            countdownState.label
          }
        </p>

        <div className="mt-0.5 flex items-center gap-1">
          {timeLeft.days >
            0 && (
            <TimeUnit
              value={
                timeLeft.days
              }
              label="d"
            />
          )}

          <TimeUnit
            value={
              timeLeft.hours
            }
            label="h"
          />

          <span className="font-black text-red-300">
            :
          </span>

          <TimeUnit
            value={
              timeLeft.minutes
            }
            label="m"
          />

          <span className="font-black text-red-300">
            :
          </span>

          <TimeUnit
            value={
              timeLeft.seconds
            }
            label="s"
          />
        </div>
      </div>
    </div>
  );
}

function calculateTimeLeft(
  milliseconds: number
): TimeLeft {
  const totalSeconds =
    Math.floor(
      milliseconds /
        1000
    );

  const days =
    Math.floor(
      totalSeconds /
        86400
    );

  const hours =
    Math.floor(
      (totalSeconds %
        86400) /
        3600
    );

  const minutes =
    Math.floor(
      (totalSeconds %
        3600) /
        60
    );

  const seconds =
    totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

function TimeUnit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <span className="min-w-[24px] text-center text-xs font-black text-gray-900 sm:text-sm">
      {String(
        value
      ).padStart(
        2,
        "0"
      )}
      <span className="ml-0.5 text-[8px] font-bold text-gray-400 sm:text-[9px]">
        {label}
      </span>
    </span>
  );
}