"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    })
    if (res?.error) {
      setError("登录失败，请检查账号密码")
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto mt-20 p-6 border rounded">
      <h2 className="text-xl mb-4">登录仪表盘</h2>
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        登录
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </form>
  )
}
