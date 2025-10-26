// src/pages/Classes.jsx
import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownOnSquareIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import Modal from "../components/Modal";
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  searchClasses,
  getSubjects,
} from "../services/otherService";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    subjectCode: "",
    description: "",
    courseContentUrl: "",
    startDate: "",
    noOfSessions: "",
    startTime: "",
    sessionDuration: "",
    maxStudents: "",
    fee: "",
    discount: "",
    status: "ACTIVE",
  });

  // pagination state
  const [page, setPage] = useState(0) // backend usually starts from 0
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  // 🔍 search form state
  const [searchForm, setSearchForm] = useState({
    subjectCode: '',
    status: ''
  })

  const statusLabels = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DELETED: "Deleted",
  };

  useEffect(() => {
    load();
    getSubjects().then(r => setSubjects(r.data || []));
    console.log(classes);
  }, []);

  const load = () => handleSearch()

  // 🔍 search handler
  const handleSearch = async () => {
    const params = new URLSearchParams({
      subjectCode: searchForm.subjectCode || '',
      status: '',
      page,
      size
    })
    const res = await searchClasses(params)
    if (res.status == 200) {
      const data = await res.data
      setClasses(data.content || [])
      setTotalPages(data.totalPages || 0)
    }
  }


  const openNew = () => {
    setEditing(null);
    setForm({
      subjectCode: "",
      description: "",
      courseContentUrl: "",
      startDate: "",
      noOfSessions: "",
      startTime: "",
      sessionDuration: "",
      maxStudents: "",
      fee: "",
      discount: "",
      status: "ACTIVE",
    });
    setOpen(true);
  };

  const openEdit = (cls) => {
    setEditing(cls);
    setForm(cls);
    setOpen(true);
  };

  const save = async () => {
    if (editing) {
      await updateClass(editing.id, form);
    } else {
      await createClass({ ...form });
    }
    setOpen(false);
    load();
  };

  const remove = async (id) => {
    if (confirm("Delete class?")) {
      await deleteClass(id);
      load();
    }
  };

  // pagination controls
  const nextPage = () => {
    if (page < totalPages - 1) setPage(page + 1)
  }
  const prevPage = () => {
    if (page > 0) setPage(page - 1)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">My Classes</h2>
        <button
          onClick={openNew}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New</span>
        </button>
      </div>

      {/* 🔍 Search Controls */}
      <div className="flex gap-2 mb-4 items-center">
        <select
          className="input w-40"
          value={searchForm.subjectCode}
          onChange={e => setSearchForm({ ...searchForm, subjectCode: e.target.value })}
        >
          <option value="">All Subjects</option>
          {subjects.map(l => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <select
          className="input w-40"
          value={searchForm.status}
          onChange={e => setSearchForm({ ...searchForm, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option key="ACTIVE" value="ACTIVE">Active</option>
          <option key="INACTIVE" value="INACTIVE">Inactive</option>
          <option key="DELETED" value="DELETED">Deleted</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="card">
        <table className="table w-full">
          <thead className="bg-blue-100 text-blue-800 text-left">
            <tr>
              <th>Subject</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>Start Time</th>
              <th>Sessions</th>
              <th>Duration</th>
              <th>Max Students</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id}>
                <td>{subjects.find((s) => s.code === cls.subjectCode)?.name || "-"}</td>
                <td>{cls.description}</td>
                <td>{cls.startDate}</td>
                <td>{cls.startTime}</td>
                <td>{cls.noOfSessions}</td>
                <td>{cls.sessionDuration} min</td>
                <td>{cls.maxStudents}</td>
                <td>{cls.fee}</td>
                <td>{statusLabels[cls.status] || cls.status}</td>
                <td>
                  <div className="flex flex-row items-center space-x-2">
                    <button
                      onClick={() => openEdit(cls)}
                      className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => remove(cls.id)}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-gray-500 py-4">
                  No classes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={prevPage}
          disabled={page === 0}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {open && (
        <Modal
          title={editing ? "Edit Class" : "New Class"}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-3">
            <select
              className="input w-full"
              value={form.subjectCode}
              onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>

            <input
              className="input"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Course Content URL"
              value={form.courseContentUrl}
              onChange={(e) =>
                setForm({ ...form, courseContentUrl: e.target.value })
              }
            />
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
            />
            <input
              type="time"
              className="input"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Number of Sessions"
              type="number"
              value={form.noOfSessions}
              onChange={(e) =>
                setForm({ ...form, noOfSessions: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Session Duration (min)"
              type="number"
              value={form.sessionDuration}
              onChange={(e) =>
                setForm({ ...form, sessionDuration: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Max Students"
              type="number"
              value={form.maxStudents}
              onChange={(e) =>
                setForm({ ...form, maxStudents: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Fee"
              type="number"
              value={form.fee}
              onChange={(e) =>
                setForm({ ...form, fee: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Discount"
              type="number"
              value={form.discount}
              onChange={(e) =>
                setForm({ ...form, discount: e.target.value })
              }
            />

            <div className="flex justify-end">
              <button
                onClick={save}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                <ArrowDownOnSquareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
