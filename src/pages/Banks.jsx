import React, { useEffect, useState } from 'react'
import { createBankDetail, updateBankDetail, searchBankDetails, getBankDetails, deleteBankDetail } from "../services/otherService";
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

export default function Banks() {
  const [banks, setBanks] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '', upiId: '',
    primaryAccount: false,
    status: ''
  })


  // pagination state
  const [page, setPage] = useState(0) // backend usually starts from 0
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  // 🔍 search form state
  const [searchForm, setSearchForm] = useState({
    accountHolderName: '',
    bankName: '',
    primaryAccount: '',
    status: ''
  })

  const statusLabels = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DELETED: "Deleted"
  };

  useEffect(() => {
      console.log("Banks");
    load()
  }, [])


  const load = () => handleSearch()

  // 🔍 search handler
  const handleSearch = async () => {
    const params = new URLSearchParams({
      accountHolderName: searchForm.accountHolderName || '',
      bankName: searchForm.bankName || '',
      primaryAccount: searchForm.primaryAccount || '',
      status: searchForm.status || '',
      page,
      size
    })
    const res = await searchBankDetails(params)
    if (res.status == 200) {
      const data = await res.data
      setBanks(data.content || [])
      setTotalPages(data.totalPages || 0)
    }
  }

  const openNew = () => {
    setEditing(null)
    setForm({
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
      primaryAccount: false,
      status: ''
    })
    setOpen(true)
  }

  const openEdit = t => {
    setEditing(t)
    setForm({
      accountHolderName: t.accountHolderName || '',
      bankName: t.bankName || '',
      accountNumber: t.accountNumber || '',
      ifscCode: t.ifscCode || '',
      upiId: t.upiId || '',
      primaryAccount: t.primaryAccount || false,
      status: t.status || ''
    })
    setOpen(true)
  }

  const save = async () => {
    if (editing) {
      await updateBankDetail(editing.id, form)
    } else {
      await createBankDetail(form)
    }
    setOpen(false)
    load()
  }

  const remove = async id => {
    if (confirm('Delete?')) {
      await deleteBankDetail(id)
      load()
    }
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
        <h2 className="text-2xl font-semibold">Banks</h2>
        <button onClick={openNew} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
           <PlusIcon className="w-5 h-5" />
           <span>New</span>
        </button>
      </div>

      {/* 🔍 Search Controls */}
      <div className="flex gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Account Holder Name"
          className="input w-32"
          value={searchForm.accountHolderName}
          onChange={e => setSearchForm({ ...searchForm, accountHolderName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Bank Name"
          className="input w-40"
          value={searchForm.bankName}
          onChange={e => setSearchForm({ ...searchForm, bankName: e.target.value })}
        />
        <select
          className="input w-40"
          value={searchForm.primaryAccount}
          onChange={e => setSearchForm({ ...searchForm, primaryAccount: e.target.value })}
        >
          <option value="">All Account Type</option>
          <option key="PRIMARY" value="PRIMARY">Primary</option>
          <option key="OTHERS" value="OTHERS">Others</option>
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
              <th>Account Holder Name</th>
              <th>Bank Name</th>
              <th>IFSC Code</th>
              <th>Account Number</th>
              <th>UPI No</th>
              <th>Is Primary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banks.map(t => (
              <tr key={t.id}>
                <td>{t.accountHolderName}</td>
                <td>{t.bankName}</td>
                <td>{t.ifscCode}</td>
                <td>{t.accountNumber}</td>
                <td>{t.upiId}</td>
                <td>{t.primaryAccount? "Yes":"No"}</td>
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
            {banks.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">No banks found</td>
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
          title={editing ? 'Edit Bank' : 'New Bank'}
          onClose={() => setOpen(false)}
        >
          {/* existing modal form remains unchanged */}
          <div className="space-y-3">
              {/* Bank dropdown */}
              <div>
                <input
                  className="input"
                  placeholder="Account Holder Name"
                  value={form.accountHolderName}
                  onChange={e =>
                    setForm({ ...form, accountHolderName: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Bank Name"
                  value={form.bankName}
                  onChange={e =>
                    setForm({ ...form, bankName: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="IFSC Code"
                  value={form.ifscCode}
                  onChange={e =>
                    setForm({ ...form, ifscCode: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="Account Number"
                  value={form.accountNumber}
                  onChange={e =>
                    setForm({ ...form, accountNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  className="input"
                  placeholder="UPI Id"
                  value={form.upiId}
                  onChange={e =>
                    setForm({ ...form, upiId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" checked={form.primaryAccount}
                    onChange={(e) => setForm({ ...form, primaryAccount: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Primary Account</span>
                </label>
              </div>
              <div>
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
              </div>
              <div className="flex justify-end">
                <button
                    onClick={save}
                    className="p-2 bg-blue-600 hover:bg-blue-400 text-blue-1200"
                    title="Save Bank Data"
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
