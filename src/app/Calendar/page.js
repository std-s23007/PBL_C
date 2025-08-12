"use client";

import React, { useState, useEffect } from "react";
import { Suspense } from "react";
import AttendanceCalendar from "./AttenddanceCalendarContent.js";

export default function CalendarPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <AttendanceCalendar />
    </Suspense>
  );
}