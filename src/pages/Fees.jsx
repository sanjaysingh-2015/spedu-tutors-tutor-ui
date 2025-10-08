import React, { useEffect, useState } from 'react'
import {
  getTutorFeeStructures,
  searchTutorFeeStructures,
  createTutorFeeStructure,
  updateTutorFeeStructure,
  deleteTutorFeeStructure,
  getLevels,
} from '../services/otherService'
import Modal from '../components/Modal'

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownOnSquareIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function Fees() {
  const [fees, setFees] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    periodType: '',
    amount: '',
    commissionRate: '',
    tutorCode: '',
    effectiveFrom: '',
    effectiveTo: '',
    levelCode: '',
    status: ''
  })
  const [levels, setLevels] = useState([])
  const [tutors, setTutors] = useState([])

  // pagination state
  const [page, setPage] = useState(0) // backend usually starts from 0
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  // 🔍 search form state
  const [searchForm, setSearchForm] = useState({
    periodType: '',
    date: '',
    levelCode: '',
    tutorCode: '',
    status: ''
  })

  const statusLabels = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DELETED: "Deleted"
  };

  useEffect(() => {
    load()
    getLevels().then(r => setLevels(r.data || []))
  }, [])

  const load = () => handleSearch()

  // 🔍 search handler
  const handleSearch = async () => {
    const params = new URLSearchParams({
      periodType: searchForm.periodType || '',
      date: searchForm.date || '',
      levelCode: searchForm.levelCode || '',
      tutorCode: searchForm.tutorCode || '',
      status: searchForm.status || '',
      page,
      size
    })
    const res = await searchTutorFeeStructures(params)
    if (res.status == 200) {
      const data = await res.data
      setFees(data.content || [])
      setTotalPages(data.totalPages || 0)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // take only yyyy-MM-dd part
  };

  const openNew = () => {
    setEditing(null)
    setForm({
      periodType: '',
      amount: '',
      commissionRate: '',
      tutorCode: '',
      effectiveFrom: '',
      effectiveTo: '',
      levelCode: '',
      status: ''
    })
    setOpen(true)
  }

  const openEdit = t => {
      console.log(t);
    setEditing(t)
    setForm({
        periodType: t.periodType || '',
        amount: t.amount || '',
        effectiveFrom: t.effectiveFrom || '',
        commissionRate: t.commissionRate || '',
        effectiveTo: t.effectiveTo || '',
        levelCode: t.levelCode || '',
        tutorCode: t.tutorCode || '',
        status: t.status || ''
    })
    setOpen(true)
  }

  const save = async () => {
    if (editing) {
      await updateTutorFeeStructure(editing.id, form)
    } else {
      await createTutorFeeStructure(form)
    }
    setOpen(false)
    load()
  }

  const remove = async id => {
    if (confirm('Delete?')) {
      await deleteTutorFeeStructure(id)
      load()
    }
  }

  const aiExtract = async () => {
    if (!form.bio) return alert('Add bio first')
    const res = await extractSkills(form.bio)
    setForm(f => ({
      ...f,
      skills: Array.isArray(res.data)
        ? res.data.join(', ')
        : res.data || ''
    }))
  }

  const handleFileUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    const res = await uploadResume(file)
    setForm(f => ({ ...f, resumeUrl: res }))
  }

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
        <h2 className="text-2xl font-semibold">Fees</h2>
        <button onClick={openNew} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
           <PlusIcon className="w-5 h-5" />
           <span>New</span>
        </button>
      </div>

      {/* 🔍 Search Controls */}
      <div className="flex gap-2 mb-4 items-center">
        <select
          className="input w-40"
          value={searchForm.tutorCode}
          onChange={e => setSearchForm({ ...searchForm, tutorCode: e.target.value })}
        >
          <option value="">All Levels</option>
          {levels.map(l => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <input
          type="date"
          placeholder="Date"
          className="input w-40"
          value={searchForm.date}
          onChange={e => setSearchForm({ ...searchForm, date: e.target.value })}
        />
        <select
          className="input w-40"
          value={searchForm.periodType}
          onChange={e => setSearchForm({ ...searchForm, periodType: e.target.value })}
        >
          <option value="">All Period</option>
          <option key="HOURLY" value="HOURLY">Hourly</option>
          <option key="SESSION" value="SESSION">Session</option>
          <option key="DAILY" value="DAILY">Daily</option>
          <option key="SUBJECT" value="SUBJECT">Subject</option>
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
          <thead className="bg-blue-100 text-blue-800  text-left">
            <tr>
              <th>Level</th>
              <th>Period Type</th>
              <th>Amount</th>
              <th>Commission Rate</th>
              <th>Effective From</th>
              <th>Expired On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map(t => (
              <tr key={t.id}>
                <td>{t.levelName}</td>
                <td>{t.periodType}</td>
                <td>{t.amount}</td>
                <td>{t.commissionRate}</td>
                <td>{t.effectiveFrom}</td>
                <td>{t.effectiveTo}</td>
                <td>{statusLabels[t.status] || t.status}</td>
                <td>
                  <div className="flex flex-row items-center space-x-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">No fees found</td>
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
          title={editing ? 'Edit Fee' : 'New Fee'}
          onClose={() => setOpen(false)}
        >
          {/* existing modal form remains unchanged */}
          <div className="space-y-3">
              {/* Level dropdown */}
              <div>
                <select
                  className="input"
                  value={form.levelCode}
                  onChange={e =>
                    setForm({ ...form, levelCode: e.target.value })
                  }
                >
                  <option value="">Select Level</option>
                  {levels.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                  <select
                    className="input w-40"
                    value={searchForm.periodType}
                    onChange={e => setForm({ ...form, periodType: e.target.value })}
                  >
                    <option value="">All Period</option>
                    <option key="HOURLY" value="HOURLY">Hourly</option>
                    <option key="SESSION" value="SESSION">Session</option>
                    <option key="DAILY" value="DAILY">Daily</option>
                    <option key="SUBJECT" value="SUBJECT">Subject</option>
                  </select>

              </div>
              <div>
                <input
                  className="input"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={e =>
                    setForm({ ...form, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Commission Rate"
                  value={form.commissionRate}
                  onChange={e =>
                    setForm({ ...form, commissionRate: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  type="date"
                  placeholder="Effective From"
                  value={formatDate(form.effectiveFrom)}
                  onChange={e =>
                    setForm({ ...form, effectiveFrom: e.target.value })
                  }
                />
              </div>
              <select
                className="input w-40"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="">Choose Status</option>
                <option key="ACTIVE" value="ACTIVE">Active</option>
                <option key="INACTIVE" value="INACTIVE">Inactive</option>
                <option key="DELETED" value="DELETED">Deleted</option>
              </select>
              <div className="flex justify-end">
                <button
                    onClick={save}
                    className="p-2 bg-blue-600 hover:bg-blue-400 text-blue-1200"
                    title="Save Fee Data"
                  >
                    <ArrowDownOnSquareIcon className="w-8 h-8" />
                </button>
              </div>
            </div>
        </Modal>
      )}
    </div>
  )
}
