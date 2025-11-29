"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock } from "lucide-react";

type DateTimePickerProps = {
  value?: { date: Date; time: Date };
  onChange: (value: { date: Date; time: Date }) => void;
};

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    value?.date || new Date()
  );
  const [selectedTime, setSelectedTime] = useState<Date>(
    value?.time || new Date()
  );

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      // Update time to keep it on the same date
      const newTime = new Date(date);
      newTime.setHours(selectedTime.getHours());
      newTime.setMinutes(selectedTime.getMinutes());
      setSelectedTime(newTime);
      onChange({ date, time: newTime });
    }
  };

  const handleTimeChange = (time: Date | null) => {
    if (time) {
      setSelectedTime(time);
      // Combine with selected date
      const combined = new Date(selectedDate);
      combined.setHours(time.getHours());
      combined.setMinutes(time.getMinutes());
      onChange({ date: selectedDate, time: combined });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-700">
          <Calendar className="h-3.5 w-3.5" />
          Observation Date
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy"
          maxDate={new Date()}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          wrapperClassName="w-full"
        />
      </div>
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-700">
          <Clock className="h-3.5 w-3.5" />
          Observation Time
        </label>
        <DatePicker
          selected={selectedTime}
          onChange={handleTimeChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          dateFormat="h:mm aa"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          wrapperClassName="w-full"
        />
      </div>
    </div>
  );
}

