"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
    >
      登出
    </button>
  )
}
