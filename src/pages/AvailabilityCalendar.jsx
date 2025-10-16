// src/pages/AvailabilityCalendar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getAvailability,            // ✅ returns tutor_availability_days list
  saveAvailability,            // ✅ saves tutor_availability (with days)
  updateAvailability,
  deleteAvailability,
  getTutorHolidays,
  getWeekends,
  saveWeekend,
} from "../services/otherService";

import {
  ArrowDownOnSquareIcon,
  GlobeAltIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMessages } from "../context/MessageContext";

// Utility Functions
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
  return date.toTimeString().split(" ")[0];
}

// Component
export default function AvailabilityCalendar() {
  const { addMessage } = useMessages();
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [weekendEvents, setWeekendEvents] = useState([]);
  const [view, setView] = useState("timeGridWeek");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "create", event: null });
  const [userName, setUserName] = useState("");

  const [weekendModalOpen, setWeekendModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  // ✅ Fetch saved weekends on load
  const fetchWeekends = async () => {
    try {
      const res = await getWeekends();
      const data = res.data;

      // Convert backend values ("Sun", "Mon", etc.) to uppercase
      const weekends = [];
      if (data?.weekendFirst) weekends.push(data.weekendFirst.trim().slice(0, 3).toUpperCase());
      if (data?.weekendSecond) weekends.push(data.weekendSecond.trim().slice(0, 3).toUpperCase());

      setSelectedDays(weekends);

      // Map "SUN" → 0, "MON" → 1, ..., "SAT" → 6
      const dayIndexMap = {
        SUN: 0,
        MON: 1,
        TUE: 2,
        WED: 3,
        THU: 4,
        FRI: 5,
        SAT: 6,
      };

      const weekendMappings = weekends.map((day) => ({
        id: `weekend-${day}`,
        daysOfWeek: [dayIndexMap[day]],
        display: "background",
        color: "rgba(255, 99, 71, 0.25)", // light red overlay
        title: "Weekend",
        editable: false,
      }));

      setWeekendEvents(weekendMappings);
    } catch (err) {
      console.error(err);
      addMessage("Failed to load weekends", "error");
    }
  };

  // ✅ Toggle selection
    const handleDayChange = (day) => {
      if (selectedDays.includes(day)) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      } else if (selectedDays.length < 2) {
        setSelectedDays([...selectedDays, day]);
      } else {
        addMessage("You can select a maximum of 2 days only.", "warning");
      }
    };

  // ✅ Save selected weekends
    const handleWeekendSave = async () => {
      try {
        await saveWeekend({ weekends: selectedDays });
        addMessage("Weekend saved successfully", "success");
        setWeekendModalOpen(false);
      } catch (err) {
        addMessage("Failed to save weekends", "error");
      }
    };

  // 🧩 Weekend Modal
    const WeekendModal = () => (
      <Dialog
        open={weekendModalOpen}
        onClose={() => setWeekendModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <Dialog.Panel className="bg-white rounded-lg p-6 z-10 w-96 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Select Your Weekend Days
          </Dialog.Title>

          <div className="flex flex-wrap gap-3 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={day}
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayChange(day)}
                  className="accent-blue-500"
                />
                <span>{day}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-2 border rounded"
              onClick={() => setWeekendModalOpen(false)}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
            <button
              className="px-3 py-2 bg-blue-600 text-white rounded"
              onClick={handleWeekendSave}
            >
              <ArrowDownOnSquareIcon className="w-4 h-4" />
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    );

  const fetchAll = async () => {
        setLoading(true);
        try {
          const [availabilityRes, holidaysRes] = await Promise.all([
            getAvailability(),
            getTutorHolidays(),
          ]);


          const mappedAvailability = availabilityRes.data.data.map((day) => ({
            id: `${day.id}`,
            title: `${day.status || "AVAILABLE"} (${day.maxBooking})`,
            start: `${day.eventDate}T${day.startTime}`,
            end: `${day.eventDate}T${day.endTime}`,
            editable: true,
            extendedProps: {
              dbId: day.id,
              tutorAvailabilityId: day.tutorAvailabilityId,
              dayOfWeek: day.dayOfWeek,
              status: day.status,
              eventDate: day.eventDate,
            },
            color:
              day.status === "ACTIVE"
                ? "green"
                : day.status === "BLOCKED"
                ? "red"
                : "gray",
          }));

          const mappedHolidays = holidaysRes.data
            .filter((h) => h.status === "ACTIVE")
            .map((h) => ({
              id: `holiday-${h.id}`,
              title: h.name || "Holiday",
              start: h.startDate,
              end: new Date(new Date(h.endDate).getTime() + 86400000),
              display: "background",
              color: "rgba(60, 60, 60, 0.85)",
              extendedProps: { isHoliday: true, ...h },
            }));

          setEvents(mappedAvailability);
          setHolidays(mappedHolidays);
        } catch (err) {
          console.error(err);
          addMessage("Failed to load availability or holidays", "error");
        } finally {
          setLoading(false);
        }
      };

  useEffect(() => {
    setUserName(localStorage.getItem("loggedInUser"));
    fetchAll();
    fetchWeekends();
  }, []); // ✅ empty dependency = runs only once

  const handleDateSelect = (selectInfo) => {
    const isHoliday = holidays.some(
      (h) =>
        new Date(selectInfo.start) >= new Date(h.start) &&
        new Date(selectInfo.start) <= new Date(h.end)
    );
    if (isHoliday) {
      addMessage("Cannot create availability on a holiday!", "warning");
      return;
    }

    function isWeekend(date, weekendDays) {
      const shortDay = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      return weekendDays.includes(shortDay);
    };

    if (isWeekend) {
      addMessage("Cannot create availability on a weekend!", "warning");
      return;
    }
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
    if (ev.extendedProps?.isHoliday) return;

    setModal({
      open: true,
      mode: "edit",
      event: {
        id: ev.id,
        start: ev.start,
        end: ev.end,
        dbId: ev.extendedProps.dbId,
        status: ev.extendedProps.status,
      },
    });
  };

  const handleEventChange = async (changeInfo) => {
    const { event } = changeInfo;
    if (event.extendedProps?.isHoliday) {
      changeInfo.revert();
      return;
    }
    try {
      await updateAvailability(event.extendedProps.dbId, {
        dayOfWeek: dayOfWeekFromDate(event.start),
        eventDate: formatLocalDate(event.start),
        startTime: formatLocalTime(event.start),
        endTime: formatLocalTime(event.end),
        status: event.extendedProps.status,
      });
      addMessage("Availability updated", "success");
    } catch (err) {
      addMessage("Failed to update slot", "error");
      changeInfo.revert();
    }
  };

  // ✅ Updated Modal for Start + End Date
  const SlotModal = ({ modal, onClose }) => {
    if (!modal.open) return null;
    const ev = modal.event;

    const [startDate, setStartDate] = useState(formatLocalDate(new Date(ev.start)));
    const [endDate, setEndDate] = useState(formatLocalDate(new Date(ev.end)));
    const [startVal, setStartVal] = useState(formatLocalTime(new Date(ev.start)));
    const [endVal, setEndVal] = useState(formatLocalTime(new Date(ev.end)));
    const [maxBooking, setMaxBooking] = useState(5);
    const [statusVal, setStatusVal] = useState(ev.status || "ACTIVE");

    const handleSave = async () => {
      const payload = {
        startDate,
        endDate,
        startTime: startVal,
        endTime: endVal,
        maxBooking,
        status: statusVal,
      };

      try {
        if (modal.mode === "create") {
          const saved = await saveAvailability(payload);
          const days = saved.data.days || []; // ✅ backend returns generated days
          const mapped = days.map((day) => ({
            id: `${day.id}`,
            title: day.status,
            start: `${day.eventDate}T${day.startTime}`,
            end: `${day.eventDate}T${day.endTime}`,
            color: day.status === "ACTIVE" ? "green" : "gray",
            extendedProps: day,
          }));
          setEvents((prev) => [...prev, ...mapped]);
          addMessage("Availability created", "success");
        } else {
          await updateAvailability(ev.dbId, payload);
          setEvents((prev) =>
            prev.map((e) =>
              e.id === ev.id
                ? {
                    ...e,
                    title: statusVal,
                    color: statusVal === "ACTIVE" ? "green" : "gray",
                  }
                : e
            )
          );
          addMessage("Availability updated", "success");
        }
        onClose();
      } catch (err) {
        addMessage("Failed to save availability", "error");
      }
    };

    const handleDelete = async () => {
      try {
        await deleteAvailability(ev.dbId);
        setEvents((prev) => prev.filter((e) => e.id !== ev.id));
        addMessage("Availability deleted", "success");
        onClose();
      } catch {
        addMessage("Failed to delete", "error");
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
        <div className="bg-white rounded-lg p-6 z-60 w-96 shadow-lg z-50">
          <h3 className="text-lg font-semibold mb-3">
            {modal.mode === "create" ? "Create Slot" : "Edit Slot"}
          </h3>

          <label className="block text-sm">Start Date</label>
          <input
            type="date"
            className="w-full border p-2 mb-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label className="block text-sm">End Date</label>
          <input
            type="date"
            className="w-full border p-2 mb-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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

          <label className="block text-sm">Max Booking</label>
          <input
            type="number"
            className="w-full border p-2 mb-2"
            min={1}
            value={maxBooking}
            onChange={(e) => setMaxBooking(e.target.value)}
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

  // Calendar render
  const changeView = (newView) => {
    setView(newView);
    calendarRef.current?.getApi()?.changeView(newView);
  };



  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{userName}'s define slot availability</h2>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
          onClick={() => setWeekendModalOpen(true)}
        >
          <GlobeAltIcon className="w-4 h-4" />
          Weekends
        </button>
      </div>

      {/* 🧩 Weekend Modal Component */}
      <WeekendModal />

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
          events={[...events, ...holidays, ...weekendEvents]}
          editable={true}
          eventResizableFromStart={true}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          height="75vh"
          allDaySlot={false}
          slotDuration={{ minutes: 30 }}
        />
      </div>

      {loading && (
        <p className="text-sm text-gray-500 mt-2">Loading availability...</p>
      )}

      <SlotModal modal={modal} onClose={() => setModal({ open: false, event: null })} />
    </div>
  );
}
