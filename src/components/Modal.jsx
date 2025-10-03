import React from 'react'
import { XMarkIcon } from "@heroicons/react/24/outline";
export default function Modal({ title, onClose, children }){
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow w-11/12 md:w-1/2 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
