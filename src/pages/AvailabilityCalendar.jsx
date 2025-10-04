import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getAvailability, saveAvailability, updateAvailability, deleteAvailability } from "../services/otherService";
import { useMessages } from "../context/MessageContext";

export default function AvailabilityCalendar() {
  const { addMessage } = useMessages();
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("timeGridWeek");
  const [interval, setInterval] = useState(30);
  const [workingDays, setWorkingDays] = useState(["MON","TUE","WED","THU","FRI"]);
  const [holidays, setHolidays] = useState(["2025-10-10"]);

  // 🔹 Load existing slots
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await getAvailability();
        const mapped = res.data.map(slot => ({
          id: slot.id,
          title: slot.status,
          start: `2025-10-06T${slot.startTime}`, // demo attach date
          end: `2025-10-06T${slot.endTime}`,
          color: slot.status === "ACTIVE" ? "green" : slot.status === "BLOCKED" ? "red" : "gray"
        }));
        setEvents(mapped);
      } catch (err) {
        addMessage("Failed to load availability", "error");
      }
    };
    fetchAvailability();
  }, []);

  // 🔹 Create slots in intervals
  const handleDateSelect = (selectInfo) => {
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    const dayOfWeek = startDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    const dayStr = startDate.toISOString().split("T")[0];

    if (!workingDays.includes(dayOfWeek) || holidays.includes(dayStr)) {
      addMessage("This day is blocked (weekend/holiday)", "warning");
      return;
    }

    let slots = [];
    let current = new Date(startDate);

    while (current < endDate) {
      let next = new Date(current.getTime() + interval * 60000);
      if (next > endDate) break;

      const slotStart = current.toISOString().split("T")[1].slice(0,8);
      const slotEnd = next.toISOString().split("T")[1].slice(0,8);

      const newEvent = {
        id: Date.now() + Math.random(),
        title: "ACTIVE",
        start: new Date(current),
        end: new Date(next),
        color: "green"
      };

      setEvents(prev => [...prev, newEvent]);

      saveAvailability({
        dayOfWeek,
        startTime: slotStart,
        endTime: slotEnd,
        isRecurring: true,
        status: "ACTIVE"
      });

      slots.push(newEvent);
      current = next;
    }
  };

  // 🔹 Delete slot
  const handleEventClick = async (clickInfo) => {
    if (window.confirm(`Delete slot ${clickInfo.event.title}?`)) {
      clickInfo.event.remove();
      await deleteAvailability(clickInfo.event.id);
      addMessage("Availability deleted", "success");
    }
  };

  // 🔹 Drag or resize slot
  const handleEventChange = async (changeInfo) => {
    const { event } = changeInfo;
    const dayOfWeek = event.start.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

    try {
      await updateAvailability(event.id, {
        dayOfWeek,
        startTime: event.start.toISOString().split("T")[1].slice(0,8),
        endTime: event.end.toISOString().split("T")[1].slice(0,8),
        isRecurring: true,
        status: "ACTIVE"
      });
      addMessage("Availability updated", "success");
    } catch (err) {
      addMessage("Failed to update slot", "error");
      event.revert(); // rollback if API fails
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Set Your Availability</h2>

      {/* Interval selector */}
      <div className="flex space-x-2 mb-4">
        <label>Interval (minutes): </label>
        <select value={interval} onChange={(e) => setInterval(Number(e.target.value))}>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={60}>60</option>
          <option value={90}>90</option>
          <option value={120}>120</option>
        </select>
      </div>

      {/* Working days */}
      <div className="flex space-x-2 mb-4">
        <label>Working Days: </label>
        {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(day => (
          <label key={day}>
            <input
              type="checkbox"
              checked={workingDays.includes(day)}
              onChange={() =>
                setWorkingDays(prev =>
                  prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                )
              }
            /> {day}
          </label>
        ))}
      </div>

      {/* Calendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        events={events}
        selectable={true}
        editable={true}         // 🔑 enables drag + resize
        eventResizableFromStart={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventChange={handleEventChange} // 🔑 handles drop/resize
        height="80vh"
      />

      {/* View Switch */}
      <div className="flex space-x-2 mt-4">
        <button onClick={() => setView("timeGridDay")} className="px-4 py-2 border rounded">Daily</button>
        <button onClick={() => setView("timeGridWeek")} className="px-4 py-2 border rounded">Weekly</button>
        <button onClick={() => setView("dayGridMonth")} className="px-4 py-2 border rounded">Monthly</button>
      </div>
    </div>
  );
}
