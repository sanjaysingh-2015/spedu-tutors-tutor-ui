import React, { useEffect, useState } from 'react'
import {
  getTutorAddresses,
  searchTutorAddresses,
  createTutorAddress,
  updateTutorAddress,
  deleteTutorAddress,
  getCountries
} from '../services/otherService'

import {
  uploadResume,
} from '../services/tutorService'
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

export default function Addresses() {
  const [tutorAddresses, setTutorAddresses] = useState([])
  const [countries, setCountries] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    tutorCode: '',
    addressType: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    countryCode: '',
    zipCode: '',
    correspondingAddress: '',
    status: ''
  })
  const [users, setUsers] = useState([])

  // pagination state
  const [page, setPage] = useState(0) // backend usually starts from 0
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  // 🔍 search form state
  const [searchForm, setSearchForm] = useState({
    tutorCode: '',
    addressType: '',
    city: '',
    state: '',
    countryCode: '',
    status: ''
  })

  const statusLabels = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DELETED: "Deleted"
  };

  useEffect(() => {
    load()
    getCountries().then(r => setCountries(r.data || []))
  }, [])

  const load = () => handleSearch()

  // 🔍 search handler
  const handleSearch = async () => {
    const params = new URLSearchParams({
      tutorCode: searchForm.tutorCode || '',
      addressType: searchForm.addressType || '',
      city: searchForm.city || '',
      state: searchForm.state || '',
      countryCode: searchForm.countryCode || '',
      status: '',
      page,
      size
    })
    const res = await searchTutorAddresses(params)
    if (res.status == 200) {
      const data = await res.data
      setTutorAddresses(data.content || [])
      setTotalPages(data.totalPages || 0)
    }
  }

  const openNew = () => {
    setEditing(null)
    setForm({
      tutorCode: '',
      addressType: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      state: '',
      countryCode: '',
      zipCode: '',
      correspondingAddress: '',
      status: ''
    })
    setOpen(true)
  }

  const openEdit = t => {
    setEditing(t)
    setForm({
      tutorCode: t.tutorCode || '',
      addressType: t.addressType || '',
      addressLine1: t.addressLine1 || '',
      addressLine2: t.addressLine2 || '',
      addressLine3: t.addressLine3 || '',
      city: t.city || '',
      state: t.state || '',
      countryCode: t.countryCode || '',
      zipCode: t.zipCode || '',
      correspondingAddress: t.correspondingAddress || '',
      status: t.status || ''
    })
    setOpen(true)
  }

  const save = async () => {
    if (editing) {
      await updateTutorAddress(editing.id, form)
    } else {
      await createTutorAddress(form)
    }
    setOpen(false)
    load()
  }

  const remove = async id => {
    if (confirm('Delete?')) {
      await deleteTutorAddress(id)
      load()
    }
  }

  const handleFileUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    const res = await uploadResume(file)
    setForm(f => ({ ...f, addressFileUrl: res }))
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
        <h2 className="text-2xl font-semibold">TutorAddresses</h2>
        <button onClick={openNew} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
           <PlusIcon className="w-5 h-5" />
           <span>New</span>
        </button>
      </div>

      {/* 🔍 Search Controls */}
      <div className="flex gap-2 mb-4 items-center">
        <select
          className="input w-40"
          value={searchForm.addressType}
          onChange={e => setSearchForm({ ...searchForm, addressType: e.target.value })}
        >
          <option value="">All Address Types</option>
          <option key="HOME" value="HOME">Home</option>
          <option key="OFFICE" value="OFFICE">Office</option>
          <option key="OTHERS" value="OTHERS">Others</option>
        </select>
        <select
          className="input w-40"
          value={searchForm.countryCode}
          onChange={e => setSearchForm({ ...searchForm, countryCode: e.target.value })}
        >
          <option value="">All Countries</option>
          {countries.map(l => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="City"
          className="input w-32"
          value={searchForm.city}
          onChange={e => setSearchForm({ ...searchForm, city: e.target.value })}
        />
        <input
          type="text"
          placeholder="State"
          className="input w-32"
          value={searchForm.state}
          onChange={e => setSearchForm({ ...searchForm, state: e.target.value })}
        />
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
              <th>Type</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Corresponding?</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tutorAddresses.map(t => (
              <tr key={t.id}>
                <td>{t.addressType}</td>
                <td>{t.addressLine1+','+t.addressLine2+','+t.addressLine3}</td>
                <td>{t.city}</td>
                <td>{t.state}</td>
                <td>{t.countryName}</td>
                <td>{t.correspondingAddress ? "Yes": "No"}</td>
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
            {tutorAddresses.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">No tutorAddresses found</td>
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
          title={editing ? 'Edit TutorAddress' : 'New TutorAddress'}
          onClose={() => setOpen(false)}
        >
          {/* existing modal form remains unchanged */}
          <div className="space-y-3">
              {/* Level dropdown */}
              <div>
                <select
                  className="input w-40"
                  value={form.addressType}
                  onChange={e => setForm({ ...form, addressType: e.target.value })}
                >
                  <option value="">All Address Types</option>
                  <option key="HOME" value="HOME">Home</option>
                  <option key="OFFICE" value="OFFICE">Office</option>
                  <option key="OTHERS" value="OTHERS">Others</option>
                </select>
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Address Line#1"
                  value={form.addressLine1}
                  onChange={e =>
                    setForm({ ...form, addressLine1: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Address Line#2"
                  value={form.addressLine2}
                  onChange={e =>
                    setForm({ ...form, addressLine2: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Address Line#3"
                  value={form.addressLine3}
                  onChange={e =>
                    setForm({ ...form, addressLine3: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="City"
                  value={form.city}
                  onChange={e =>
                    setForm({ ...form, city: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="State"
                  value={form.state}
                  onChange={e =>
                    setForm({ ...form, state: e.target.value })
                  }
                />
              </div>
              <div>
                <select
                  className="input w-40"
                  value={form.countryCode}
                  onChange={e => setForm({ ...form, countryCode: e.target.value })}
                >
                  <option value="">All Countries</option>
                  {countries.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Zip Code"
                  value={form.zipCode}
                  onChange={e =>
                    setForm({ ...form, zipCode: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" checked={form.correspondingAddress}
                    onChange={(e) => setForm({ ...form, correspondingAddress: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Corresponding?</span>
                </label>
              </div>
              <div className="flex justify-end">
                <button
                    onClick={save}
                    className="p-2 bg-blue-600 hover:bg-blue-400 text-blue-1200"
                    title="Save TutorAddress Data"
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
