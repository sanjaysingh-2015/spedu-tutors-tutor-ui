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
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatLocalDateTime(date) {
  return `${formatLocalDate(date)}T${formatLocalTime(date)}`;
}

function formatLocalTime(date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mi}:${ss}`;
}

function nextDateForDayOfWeek(baseDateISO, dowShort) {
  const target = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].indexOf(
    dowShort
  );
  if (target === -1) return baseDateISO;
  const base = new Date(baseDateISO);
  const diff = (target + 7 - base.getDay()) % 7;
  const result = new Date(base);
  result.setDate(base.getDate() + diff);
  return formatLocalDate(result);
}

/**
 * Component
 */
export default function AvailabilityCalendar() {
  const { addMessage } = useMessages();
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [view, setView] = useState("timeGridWeek");
  const [interval, setInterval] = useState(30);
  const [workingDays, setWorkingDays] = useState([
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ]);
  const [holidays, setHolidays] = useState(["2025-10-10"]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, event: null });

  // Fetch availability
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAvailability();
        const mapped = res.data.map((slot) => {
          const showDate = nextDateForDayOfWeek(
            new Date().toISOString(),
            slot.dayOfWeek
          );

          return {
            id: `${slot.eventId}::${slot.id}`,
            title: slot.status || "AVAILABLE",
            start: `${showDate}T${slot.startTime}`,
            end: `${showDate}T${slot.endTime}`,
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
    console.log(mapped);
        setEvents(mapped);
      } catch (err) {
        addMessage("Failed to load availability", "error");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [addMessage]);

  // Slot creation
  const handleDateSelect = async (selectInfo) => {
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(startDate.getTime() + interval * 60000);

    const dayStr = formatLocalDate(startDate);
    const dayOfWeek = dayOfWeekFromDate(startDate);

    if (!workingDays.includes(dayOfWeek) || holidays.includes(dayStr)) {
      addMessage(
        "This day is blocked (weekend/holiday). Change working days or holidays to proceed.",
        "warning"
      );
      return;
    }

    addMessage(
      `Creating slots from ${formatLocalDateTime(startDate)} to ${formatLocalDateTime(
        endDate
      )} with interval ${interval} minutes...`,
      "info"
    );

    const seriesEventId = generateUUID();
    let current = new Date(startDate);
    const newEvents = [];
console.log(startDate);
console.log(endDate);
    while (current < endDate) {
      const next = new Date(current.getTime() + interval * 60000);
      if (next > endDate) break;

      const payload = {
        eventId: seriesEventId,
        dayOfWeek,
        startTime: formatLocalTime(current), // plain HH:mm:ss
        endTime: formatLocalTime(next),
        isRecurring: true,
        status: "ACTIVE",
        tutorId: undefined,
      };

      try {
        const saved = await saveAvailability(payload);
        const savedSlot = saved.data || saved;
        const showDate = formatLocalDate(current);

        newEvents.push({
          id: `${savedSlot.eventId}::${savedSlot.id}`,
          title: savedSlot.status || "ACTIVE",
          start: `${showDate}T${savedSlot.startTime}`,
          end: `${showDate}T${savedSlot.endTime}`,
          editable: true,
          extendedProps: {
            eventId: savedSlot.eventId,
            dbId: savedSlot.id,
            tutorId: savedSlot.tutorId,
            dayOfWeek: savedSlot.dayOfWeek,
            status: savedSlot.status,
          },
          color: savedSlot.status === "ACTIVE" ? "green" : "gray",
        });
      } catch (err) {
        addMessage(
          `Failed to save slot ${formatLocalTime(current)} - ${formatLocalTime(
            next
          )}`,
          "error"
        );
      }
      current = next;
    }

    if (newEvents.length > 0) {
      setEvents((prev) => [...prev, ...newEvents]);
      addMessage(`${newEvents.length} slots created successfully.`, "success");
    }
  };

  // Edit slot
  const performEdit = async ({
    eventId,
    dbId,
    newStart,
    newEnd,
    fcEventId,
    newStatus,
  }) => {
    const dow = dayOfWeekFromDate(newStart);
    const payload = {
      dayOfWeek: dow,
      startTime: formatLocalTime(newStart),
      endTime: formatLocalTime(newEnd),
      isRecurring: true,
      status: newStatus || "ACTIVE",
    };

    try {
      await updateAvailability(eventId, payload);
      const showDate = formatLocalDate(newStart);

      setEvents((prev) =>
        prev.map((e) =>
          e.id === fcEventId
            ? {
                ...e,
                start: `${showDate}T${payload.startTime}`,
                end: `${showDate}T${payload.endTime}`,
                title: payload.status,
                extendedProps: {
                  ...e.extendedProps,
                  status: payload.status,
                  dayOfWeek: payload.dayOfWeek,
                },
              }
            : e
        )
      );
      addMessage("Updated", "success");
      setEditModal({ open: false, event: null });
    } catch (err) {
      addMessage("Failed to update slot", "error");
    }
  };

  // Delete slot
  const performDelete = async ({ eventId, dbId, fcEventId }) => {
    const deleteSeries = window.confirm(
      "Delete entire series (OK) or only this slot (Cancel)?"
    );
    try {
      if (deleteSeries) {
        await deleteAvailability(eventId);
        setEvents((prev) => prev.filter((e) => !e.id.startsWith(eventId)));
      } else {
        await deleteAvailability(dbId || eventId);
        setEvents((prev) => prev.filter((e) => e.id !== fcEventId));
      }
      addMessage("Deleted", "success");
    } catch (err) {
      addMessage("Failed to delete slot(s)", "error");
    } finally {
      setEditModal({ open: false, event: null });
    }
  };

  // Event change via drag/resize
  const handleEventChange = async (changeInfo) => {
    const { event } = changeInfo;
    const fcEventId = event.id;
    const eventId = event.extendedProps.eventId;
    const start = event.start;
    const end = event.end;

    const dayStr = formatLocalDate(start);
    const dow = dayOfWeekFromDate(start);
    if (!workingDays.includes(dow) || holidays.includes(dayStr)) {
      addMessage(
        "Cannot move slot to a blocked day (weekend/holiday)",
        "warning"
      );
      changeInfo.revert();
      return;
    }

    const payload = {
      dayOfWeek: dow,
      startTime: formatLocalTime(start),
      endTime: formatLocalTime(end),
      isRecurring: true,
      status: event.extendedProps.status || "ACTIVE",
    };

    try {
      await updateAvailability(eventId, payload);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === fcEventId
            ? {
                ...e,
                start: `${dayStr}T${payload.startTime}`,
                end: `${dayStr}T${payload.endTime}`,
                title: payload.status,
                extendedProps: { ...e.extendedProps, dayOfWeek: dow },
              }
            : e
        )
      );
      addMessage("Availability updated", "success");
    } catch (err) {
      addMessage("Failed to update slot", "error");
      changeInfo.revert();
    }
  };

  // Event click
  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;
    setEditModal({
      open: true,
      event: {
        id: ev.id,
        title: ev.title,
        start: ev.start,
        end: ev.end,
        eventId: ev.extendedProps.eventId,
        dbId: ev.extendedProps.dbId,
        status: ev.extendedProps.status,
      },
    });
  };

  // Edit Modal
  const EditModal = ({ modal, onClose, onDelete, onSave }) => {
    if (!modal.open || !modal.event) return null;
    const ev = modal.event;
    const [startVal, setStartVal] = useState(formatLocalDateTime(ev.start));
    const [endVal, setEndVal] = useState(formatLocalDateTime(ev.end));
    const [statusVal, setStatusVal] = useState(ev.status || "ACTIVE");

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="absolute inset-0 bg-black opacity-40"
          onClick={onClose}
        ></div>
        <div className="bg-white rounded-lg p-6 z-60 w-96 shadow-lg">
          <h3 className="text-lg font-semibold mb-3">Edit Slot</h3>
          <label className="block text-sm">Start</label>
          <input
            type="datetime-local"
            className="w-full border p-2 mb-2"
            value={startVal}
            onChange={(e) => setStartVal(e.target.value)}
          />
          <label className="block text-sm">End</label>
          <input
            type="datetime-local"
            className="w-full border p-2 mb-2"
            value={endVal}
            onChange={(e) => setEndVal(e.target.value)}
          />
          <label className="block text-sm">Status</label>
          <select
            className="w-full border p-2 mb-4"
            value={statusVal}
            onChange={(e) => setStatusVal(e.target.value)}
          >
            <option>ACTIVE</option>
            <option>BLOCKED</option>
            <option>INACTIVE</option>
          </select>

          <div className="flex justify-between">
            <button
              className="px-3 py-2 border rounded"
              onClick={() =>
                onDelete({ eventId: ev.eventId, dbId: ev.dbId, fcEventId: ev.id })
              }
            >
              Delete
            </button>
            <div className="flex space-x-2">
              <button className="px-3 py-2 border rounded" onClick={onClose}>
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={() =>
                  onSave({
                    eventId: ev.eventId,
                    dbId: ev.dbId,
                    fcEventId: ev.id,
                    newStart: new Date(startVal),
                    newEnd: new Date(endVal),
                    newStatus: statusVal,
                  })
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Change view
  const changeView = (v) => {
    setView(v);
    const calendarApi =
      calendarRef.current && calendarRef.current.getApi && calendarRef.current.getApi();
    if (calendarApi) calendarApi.changeView(v);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Set Your Availability</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center space-x-2">
          <label>Interval (minutes):</label>
          <select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="border px-2 py-1"
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
            <option value={120}>120</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label>Working Days:</label>
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
            <label key={d} className="text-sm mr-2">
              <input
                type="checkbox"
                checked={workingDays.includes(d)}
                onChange={() =>
                  setWorkingDays((prev) =>
                    prev.includes(d)
                      ? prev.filter((x) => x !== d)
                      : [...prev, d]
                  )
                }
              />{" "}
              <span className="ml-1">{d}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <label>Holidays:</label>
          <input
            type="text"
            className="border px-2 py-1"
            value={holidays.join(",")}
            onChange={(e) =>
              setHolidays(
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
              )
            }
          />
        </div>

        <div className="ml-auto flex space-x-2">
          <button
            onClick={() => changeView("timeGridDay")}
            className="px-3 py-1 border rounded"
          >
            Day
          </button>
          <button
            onClick={() => changeView("timeGridWeek")}
            className="px-3 py-1 border rounded"
          >
            Week
          </button>
          <button
            onClick={() => changeView("dayGridMonth")}
            className="px-3 py-1 border rounded"
          >
            Month
          </button>
        </div>
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

      <EditModal
        modal={editModal}
        onClose={() => setEditModal({ open: false, event: null })}
        onDelete={({ eventId, dbId, fcEventId }) =>
          performDelete({ eventId, dbId, fcEventId })
        }
        onSave={({ eventId, dbId, fcEventId, newStart, newEnd, newStatus }) =>
          performEdit({ eventId, dbId, fcEventId, newStart, newEnd, newStatus })
        }
      />
    </div>
  );
}
