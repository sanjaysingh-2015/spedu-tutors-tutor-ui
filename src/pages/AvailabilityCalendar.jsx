// src/pages/AvailabilityCalendar.jsx
import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getAvailability,
  saveAvailability,
  updateAvailability,
  deleteAvailability,
} from "../services/otherService";
import { useMessages } from "../context/MessageContext";

/**
 * Utility Functions
 */
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function dayOfWeekFromDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}
function formatLocalDate(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatLocalTime(date) {
  return date.toTimeString().split(" ")[0]; // HH:mm:ss
}

/**
 * Component
 */
export default function AvailabilityCalendar() {
  const { addMessage } = useMessages();
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [view, setView] = useState("timeGridWeek");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "create", event: null });

  // Fetch availability
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAvailability();
        const mapped = res.data.map((slot) => {
          const showDate = slot.eventDate;
          return {
            id: `${slot.eventId}::${slot.id}`,
            title: slot.status || "AVAILABLE",
            start: `${formatLocalDate(showDate)}T${slot.startTime}`,
            end: `${formatLocalDate(showDate)}T${slot.endTime}`,
            editable: true,
            extendedProps: {
              eventId: slot.eventId,
              dbId: slot.id,
              tutorId: slot.tutorId,
              dayOfWeek: slot.dayOfWeek,
              status: slot.status,
            },
            color:
              slot.status === "ACTIVE"
                ? "green"
                : slot.status === "BLOCKED"
                ? "red"
                : "gray",
          };
        });
        setEvents(mapped);
      } catch (err) {
        addMessage("Failed to load availability", "error");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [addMessage]);

  /**
   * Calendar Handlers
   */
  const handleDateSelect = (selectInfo) => {
    setModal({
      open: true,
      mode: "create",
      event: {
        start: selectInfo.start,
        end: selectInfo.end,
        isRecurring: true,
        status: "ACTIVE",
      },
    });
  };

  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;
    setModal({
      open: true,
      mode: "edit",
      event: {
        id: ev.id,
        start: ev.start,
        end: ev.end,
        eventId: ev.extendedProps.eventId,
        dbId: ev.extendedProps.dbId,
        status: ev.extendedProps.status,
        isRecurring: ev.extendedProps.isRecurring,
      },
    });
  };

  const handleEventChange = async (changeInfo) => {
    const { event } = changeInfo;
    try {
      await updateAvailability(event.extendedProps.eventId, {
        dayOfWeek: dayOfWeekFromDate(event.start),
        eventDate: formatLocalDate(event.start),
        startTime: formatLocalTime(event.start),
        endTime: formatLocalTime(event.end),
        isRecurring: event.extendedProps.isRecurring,
        status: event.extendedProps.status,
      });
      addMessage("Availability updated", "success");
    } catch (err) {
      addMessage("Failed to update slot", "error");
      changeInfo.revert();
    }
  };

  /**
   * Slot Modal
   */
  const SlotModal = ({ modal, onClose }) => {
    if (!modal.open) return null;
    const ev = modal.event;

    const [dateVal, setDateVal] = useState(formatLocalDate(new Date(ev.start)));
    const [startVal, setStartVal] = useState(formatLocalTime(new Date(ev.start)));
    const [endVal, setEndVal] = useState(formatLocalTime(new Date(ev.end)));
    const [statusVal, setStatusVal] = useState(ev.status || "ACTIVE");
    const [recurring, setRecurring] = useState(ev.isRecurring ?? true);

    const handleSave = async () => {
      const startDate = new Date(`${dateVal}T${startVal}`);
      const endDate = new Date(`${dateVal}T${endVal}`);

      const payload = {
        eventId: ev.eventId || generateUUID(),
        dayOfWeek: dayOfWeekFromDate(startDate),
        eventDate: formatLocalDate(startDate),
        startTime: startVal,
        endTime: endVal,
        isRecurring: recurring,
        status: statusVal,
      };

      try {
        if (modal.mode === "create") {
          const saved = await saveAvailability(payload);
          const savedSlot = saved.data || saved;
          const showDate = dateVal;

          setEvents((prev) => [
            ...prev,
            {
              id: `${savedSlot.eventId}::${savedSlot.id}`,
              title: savedSlot.status,
              eventDate: savedSlot.eventDate,
              start: `${showDate}T${savedSlot.startTime}`,
              end: `${showDate}T${savedSlot.endTime}`,
              extendedProps: savedSlot,
              color: savedSlot.status === "ACTIVE" ? "green" : "gray",
            },
          ]);
          addMessage("Slot created", "success");
        } else {
          await updateAvailability(ev.eventId, payload);
          setEvents((prev) =>
            prev.map((e) =>
              e.id === ev.id
                ? {
                    ...e,
                    start: `${dateVal}T${startVal}`,
                    end: `${dateVal}T${endVal}`,
                    eventDate: `${dateVal}`,
                    title: statusVal,
                    extendedProps: { ...e.extendedProps, ...payload },
                  }
                : e
            )
          );
          addMessage("Slot updated", "success");
        }
        onClose();
      } catch (err) {
        addMessage("Failed to save slot", "error");
      }
    };

    const handleDelete = async () => {
      try {
        await deleteAvailability(ev.eventId || ev.dbId);
        setEvents((prev) => prev.filter((e) => e.id !== ev.id));
        addMessage("Slot deleted", "success");
        onClose();
      } catch (err) {
        addMessage("Failed to delete slot", "error");
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
        <div className="bg-white rounded-lg p-6 z-60 w-96 shadow-lg z-50">
          <h3 className="text-lg font-semibold mb-3">
            {modal.mode === "create" ? "Create Slot" : "Edit Slot"}
          </h3>

          <label className="block text-sm">Date</label>
          <input
            type="date"
            className="w-full border p-2 mb-2"
            value={dateVal}
            onChange={(e) => setDateVal(e.target.value)}
          />

          <label className="block text-sm">Start Time</label>
          <input
            type="time"
            className="w-full border p-2 mb-2"
            value={startVal}
            onChange={(e) => setStartVal(e.target.value)}
          />

          <label className="block text-sm">End Time</label>
          <input
            type="time"
            className="w-full border p-2 mb-2"
            value={endVal}
            onChange={(e) => setEndVal(e.target.value)}
          />

          <label className="block text-sm">Status</label>
          <select
            className="w-full border p-2 mb-2"
            value={statusVal}
            onChange={(e) => setStatusVal(e.target.value)}
          >
            <option>ACTIVE</option>
            <option>BLOCKED</option>
            <option>INACTIVE</option>
          </select>

          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
            />
            <span>Recurring</span>
          </label>

          <div className="flex justify-between">
            {modal.mode === "edit" && (
              <button
                className="px-3 py-2 border rounded text-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <div className="ml-auto flex space-x-2">
              <button className="px-3 py-2 border rounded" onClick={onClose}>
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔹 Custom View Switch Buttons
  const changeView = (newView) => {
    setView(newView);
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(newView);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Set Your Availability</h2>

      {/* Custom View Toolbar */}
      <div className="flex justify-end mb-2 space-x-2">
        <button
          className={`px-3 py-1 border rounded ${
            view === "timeGridDay" ? "bg-blue-600 text-white" : ""
          }`}
          onClick={() => changeView("timeGridDay")}
        >
          Day
        </button>
        <button
          className={`px-3 py-1 border rounded ${
            view === "timeGridWeek" ? "bg-blue-600 text-white" : ""
          }`}
          onClick={() => changeView("timeGridWeek")}
        >
          Week
        </button>
        <button
          className={`px-3 py-1 border rounded ${
            view === "dayGridMonth" ? "bg-blue-600 text-white" : ""
          }`}
          onClick={() => changeView("dayGridMonth")}
        >
          Month
        </button>
      </div>

      <div className="bg-white rounded shadow p-2">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          selectable={true}
          selectMirror={true}
          timeZone="local"
          select={handleDateSelect}
          events={events}
          editable={true}
          eventResizableFromStart={true}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          height="75vh"
          allDaySlot={false}
          slotDuration={{ minutes: 15 }}
        />
      </div>

      {loading && (
        <p className="text-sm text-gray-500 mt-2">Loading availability...</p>
      )}

      <SlotModal modal={modal} onClose={() => setModal({ open: false, event: null })} />
    </div>
  );
}
