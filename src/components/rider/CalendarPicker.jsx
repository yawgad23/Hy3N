import { useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

export default function CalendarPicker({ selectedDate, onDateSelect, minDate, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isDateDisabled = (date) => {
    if (!minDate) return false;
    return date < minDate;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-bold text-lg">Select Date & Time</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-heading font-bold text-xl">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {allDays.map((day, idx) => {
            const disabled = isDateDisabled(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const sameMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => !disabled && onDateSelect(day)}
                disabled={disabled}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                  ${disabled ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-primary/20"}
                  ${selected ? "bg-primary text-primary-foreground shadow-md" : ""}
                  ${!selected && sameMonth && !disabled ? "text-foreground" : ""}
                  ${!sameMonth ? "text-muted-foreground/40" : ""}
                  ${today && !selected ? "border border-primary text-primary" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-border pt-4"
          >
            <h4 className="font-heading font-semibold text-sm mb-3">Available Time Slots</h4>
            <div className="grid grid-cols-4 gap-2">
              {generateTimeSlots(selectedDate).map((timeSlot) => {
                const isSelected = selectedDate && isSameDay(timeSlot, selectedDate) && 
                  timeSlot.getHours() === selectedDate.getHours() &&
                  timeSlot.getMinutes() === selectedDate.getMinutes();
                const disabled = isDateDisabled(timeSlot);

                return (
                  <button
                    key={timeSlot.toISOString()}
                    onClick={() => !disabled && onDateSelect(timeSlot)}
                    disabled={disabled}
                    className={`
                      py-2 px-1 rounded-lg text-xs font-medium transition-all
                      ${disabled ? "text-muted-foreground/30 cursor-not-allowed bg-secondary/50" : "hover:bg-primary/20"}
                      ${isSelected ? "bg-primary text-primary-foreground shadow" : "bg-secondary text-foreground"}
                    `}
                  >
                    {format(timeSlot, "h:mm a")}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Selected</p>
            <p className="font-heading font-bold text-lg text-primary">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "h:mm a")}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function generateTimeSlots(baseDate) {
  const slots = [];
  const start = new Date(baseDate);
  start.setHours(6, 0, 0, 0); // Start from 6 AM

  for (let i = 0; i < 40; i++) {
    const slot = new Date(start);
    slot.setMinutes(i * 30); // 30-minute intervals
    if (slot.getHours() < 23) { // Until 11 PM
      slots.push(slot);
    }
  }

  return slots;
}