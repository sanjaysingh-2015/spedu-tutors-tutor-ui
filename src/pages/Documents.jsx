import React, { useEffect, useState } from 'react'
import {
  getTutorDocuments,
  searchTutorDocuments,
  createTutorDocument,
  updateTutorDocument,
  deleteTutorDocument,
  getDocumentCategories,
  getDocuments,
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

export default function Documents() {
  const [tutorDocuments, setTutorDocuments] = useState([])
  const [documentCategories, setDocumentCategories] = useState([])
  const [documents, setDocuments] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    documentCategoryCode: '',
    documentCode: '',
    tutorCode: '',
    documentNumber: '',
    documentFileUrl: '',
    status: ''
  })
  const [users, setUsers] = useState([])

  // pagination state
  const [page, setPage] = useState(0) // backend usually starts from 0
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  // 🔍 search form state
  const [searchForm, setSearchForm] = useState({
    documentCategoryCode: '',
    documentCode: '',
    tutorCode: '',
    documentNumber: '',
    status: ''
  })

  const statusLabels = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DELETED: "Deleted"
  };

  useEffect(() => {
    load()
    getDocumentCategories().then(r => setDocumentCategories(r.data || []))
    getDocuments().then(r => setDocuments(r.data || []))
  }, [])

  const load = () => handleSearch()

  // 🔍 search handler
  const handleSearch = async () => {
    const params = new URLSearchParams({
      documentCategoryCode: searchForm.documentCategoryCode || '',
      documentCode: searchForm.documentCode || '',
      tutorCode: searchForm.tutorCode || '',
      documentNumber: searchForm.documentNumber || '',
      status: searchForm.status || '',
      page,
      size
    })
    const res = await searchTutorDocuments(params)
    if (res.status == 200) {
      const data = await res.data
      setTutorDocuments(data.content || [])
      setTotalPages(data.totalPages || 0)
    }
  }

  const openNew = () => {
    setEditing(null)
    setForm({
      documentCategoryCode: '',
      documentCode: '',
      tutorCode: '',
      documentNumber: '',
      documentFileUrl: '',
      status: ''
    })
    setOpen(true)
  }

  const openEdit = t => {
    setEditing(t)
    setForm({
      documentCategoryCode: t.documentCategoryCode || '',
      documentCode: t.documentCode || '',
      tutorCode: t.tutorCode || '',
      documentNumber: t.documentNumber || '',
      documentFileUrl: t.documentFileUrl || '',
      status: t.status || ''
    })
    setOpen(true)
  }

  const save = async () => {
    if (editing) {
      await updateTutorDocument(editing.id, form)
    } else {
      await createTutorDocument(form)
    }
    setOpen(false)
    load()
  }

  const remove = async id => {
    if (confirm('Delete?')) {
      await deleteTutorDocument(id)
      load()
    }
  }

  const handleFileUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    const res = await uploadResume(file)
    setForm(f => ({ ...f, documentFileUrl: res }))
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
        <h2 className="text-2xl font-semibold">Tutor Documents</h2>
        <button onClick={openNew} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
           <PlusIcon className="w-5 h-5" />
           <span>New</span>
        </button>
      </div>

      {/* 🔍 Search Controls */}
      <div className="flex gap-2 mb-4 items-center">
        <select
          className="input w-40"
          value={searchForm.documentCategoryCode}
          onChange={e => setSearchForm({ ...searchForm, documentCategoryCode: e.target.value })}
        >
          <option value="">All Categories</option>
          {documentCategories.map(l => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <select
          className="input w-40"
          value={searchForm.documentCode}
          onChange={e => setSearchForm({ ...searchForm, documentCode: e.target.value })}
        >
          <option value="">All Documents</option>
          {documents.map(l => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Document Number"
          className="input w-32"
          value={searchForm.documentNumber}
          onChange={e => setSearchForm({ ...searchForm, documentNumber: e.target.value })}
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
              <th>Category</th>
              <th>Document</th>
              <th>Document No</th>
              <th>File url</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tutorDocuments.map(t => (
              <tr key={t.id}>
                <td>{t.documentCategoryName}</td>
                <td>{t.documentName}</td>
                <td>{t.documentNumber}</td>
                <td>{t.documentFileUrl}</td>
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
            {tutorDocuments.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">No tutorDocuments found</td>
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
          title={editing ? 'Edit TutorDocument' : 'New TutorDocument'}
          onClose={() => setOpen(false)}
        >
          {/* existing modal form remains unchanged */}
          <div className="space-y-3">
              {/* Level dropdown */}
              <div>
                <select
                  className="input w-40"
                  value={form.tutorCode}
                  onChange={e => setForm({ ...form, tutorCode: e.target.value })}
                >
                  <option value="">All Tutors</option>
                  {tutors.map(l => (
                    <option key={l.code} value={l.code}>{l.firstName +' '+ l.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="input w-40"
                  value={form.documentCategoryCode}
                  onChange={e => setForm({ ...form, documentCategoryCode: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {documentCategories.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="input w-40"
                  value={form.documentCode}
                  onChange={e => setForm({ ...form, documentCode: e.target.value })}
                >
                  <option value="">All Documents</option>
                  {documents.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Document Number"
                  value={form.documentNumber}
                  onChange={e =>
                    setForm({ ...form, documentNumber: e.target.value })
                  }
                />
              </div>
              {/* Resume file upload */}
              <div>
                <input type="file" onChange={handleFileUpload} />
                {form.documentFileUrl && (
                  <p className="text-sm text-green-600">
                    Uploaded: {form.documentFileUrl}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                    onClick={save}
                    className="p-2 bg-blue-600 hover:bg-blue-400 text-blue-1200"
                    title="Save TutorDocument Data"
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
