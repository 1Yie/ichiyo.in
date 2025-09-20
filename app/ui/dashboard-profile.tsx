"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Ban, IdCard, Mail, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardLayout from "@/ui/dashboard-layout";
import { useUser, useAdminCheck } from "@/contexts/user-context";
import ms from "ms";

export default function DashboardProfile() {
  const { userInfo, logout, refreshUser, isAuthenticated } = useUser();

  // 编辑用户名相关状态
  const [formName, setFormName] = useState(userInfo?.name || "");
  const [showEditDialog, setShowEditDialog] = useState(false);

  // 修改密码相关状态
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // 管理员设置弹窗状态
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // 注册密钥相关状态
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [registerKey, setRegisterKey] = useState<{
    id: number;
    value: string;
    expiresAt: number;
    isNew: boolean;
  }>({
    id: 0,
    value: "",
    expiresAt: 0,
    isNew: false,
  });
  // 密钥加载状态
  const [loadingKey, setLoadingKey] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>("");

  useEffect(() => {
    if (!showKeyDialog || !registerKey.expiresAt) return;

    const updateRemainingTime = () => {
      const now = Date.now();
      const diff = registerKey.expiresAt - now;

      if (diff <= 0) {
        setRemainingTime("已过期");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemainingTime(`${minutes}分${seconds.toString().padStart(2, "0")}秒`);
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [showKeyDialog, registerKey.expiresAt]);

  // 同步 userInfo.name 到本地编辑状态
  useEffect(() => {
    if (userInfo?.name) setFormName(userInfo.name);
  }, [userInfo]);

  // 关闭编辑用户名弹窗时重置状态
  useEffect(() => {
    if (!showEditDialog) setFormName(userInfo?.name || "");
  }, [showEditDialog, userInfo]);

  // 关闭密码弹窗清理
  useEffect(() => {
    if (!showPasswordDialog) {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    }
  }, [showPasswordDialog]);

  // 编辑用户名提交
  const handleSubmitName = async () => {
    if (!formName.trim()) {
      toast.error("用户名不能为空");
      return;
    }

    if (formName.trim() === userInfo?.name) {
      return;
    }

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: formName.trim() }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "修改用户名失败");
      }

      // 先关闭对话框
      setShowEditDialog(false);

      // 然后刷新用户数据
      await refreshUser();

      toast.success("用户名修改成功");
    } catch (error) {
      toast.error(
        "修改用户名失败: " + (error instanceof Error ? error.message : "")
      );
    }
  };
  // 修改密码提交
  const handleChangePassword = async () => {
    // 验证密码长度
    if (newPassword.length < 6) {
      setPasswordError("密码长度至少6位");
      return false;
    }

    // 验证密码一致性
    if (newPassword !== confirmPassword) {
      setPasswordError("两次密码输入不一致");
      return false;
    }

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "修改密码失败");
      }

      toast.success("密码修改成功");
      setShowPasswordDialog(false);
      logout();
      return true;
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "修改密码失败");
      return false;
    }
  };

  // 添加管理员
  // TODO: 实现添加管理员功能
  const handleAddAdmin = () => {
    if (!newAdminEmail.includes("@")) {
      alert("请输入有效的邮箱地址");
      return;
    }
    alert(`管理员 ${newAdminEmail} 添加成功`);
    setNewAdminEmail("");
    setShowAdminDialog(false);
  };

  // 获取密钥有效期配置
  const getKeyTTLDisplay = () => {
    const keyTTL = process.env.NEXT_PUBLIC_KEY_TTL_MS as ms.StringValue;
    try {
      const milliseconds = ms(keyTTL);
      if (typeof milliseconds !== "number") return "未知";

      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);

      if (minutes > 0 && seconds > 0) {
        return `${minutes} 分钟 ${seconds} 秒`;
      } else if (minutes > 0) {
        return `${minutes} 分钟`;
      } else {
        return `${seconds} 秒`;
      }
    } catch {
      return "未知";
    }
  };

  // 检查密钥状态
  const checkKeyStatus = async () => {
    try {
      const res = await fetch("/api/register/key/status", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("检查密钥状态失败");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("检查密钥状态失败:", error);
      return null;
    }
  };

  // 生成注册密钥
  const handleGenerateKey = async () => {
    setLoadingKey(true);
    try {
      // 首先检查当前密钥状态
      const statusData = await checkKeyStatus();

      if (statusData && statusData.exists && statusData.isValid) {
        // 如果存在有效密钥，直接显示
        setRegisterKey({
          id: statusData.id,
          value: statusData.key,
          expiresAt: parseInt(statusData.expiresAt),
          isNew: false,
        });
        setShowKeyDialog(true);
        toast.info("当前密钥仍有效");
        return;
      }

      // 如果没有有效密钥，生成新密钥
      const res = await fetch("/api/register/key", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("生成密钥失败");
      }

      const data = await res.json();
      if (!data.key || !data.expiresAt || !data.id) {
        throw new Error("无效的密钥响应");
      }

      setRegisterKey({
        id: data.id,
        value: data.key,
        expiresAt: parseInt(data.expiresAt),
        isNew: true,
      });

      setShowKeyDialog(true);
      toast.success("新注册密钥已生成");
    } catch (error) {
      toast.error(
        "生成密钥失败: " + (error instanceof Error ? error.message : "")
      );
    } finally {
      setLoadingKey(false);
    }
  };

  const isAdmin = useAdminCheck();
  console.log(isAdmin);

  if (!isAuthenticated || !userInfo) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "仪表盘", href: "/dashboard" },
          { label: "设置", href: "/dashboard/profile" },
        ]}
      >
        <div className="flex-1 rounded-xl p-4 bg-diagonal-stripes">
          <div className="w-full h-full rounded-xl flex justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Ban className="w-18 h-18 text-foreground/90" />
              <h1 className="text-lg text-foreground/90">登录状态失效</h1>
              <p className="text-sm text-foreground/90">请重新登录。</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "仪表盘", href: "/dashboard" },
        { label: "设置", href: "/dashboard/profile" },
      ]}
    >
      {/* 个人信息 */}
      <h1 className="text-2xl font-bold mb-4 text-foreground/90">个人信息</h1>
      <div className="flex justify-between items-center bg-muted/50 rounded-2xl p-3">
        <div className="flex items-center gap-4">
          <Image
            src={userInfo.avatar}
            alt="头像"
            className="w-12 h-12 rounded-full shrink-0 border border-foreground/20"
            width={13}
            height={13}
            priority
            quality={100}
            unoptimized
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-foreground/90" />
              <p className="text-base text-foreground">{userInfo.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-foreground/90" />
              <p className="text-base text-foreground">{userInfo.email}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>编辑信息</Button>
      </div>

      <hr className="my-4 bg-foreground/30" />

      {/* 安全 */}
      <h1 className="text-2xl font-bold mb-4 text-foreground/90">安全</h1>
      <div className="flex justify-between bg-muted/50 rounded-2xl p-3">
        <div className="flex items-center gap-4">
          <div className="shrink-0">密码</div>
          <p className="text-lg text-foreground/60">********</p>
        </div>
        <Button onClick={() => setShowPasswordDialog(true)}>修改密码</Button>
      </div>

      {/* 高级设置 */}
      {isAdmin.isAdmin && (
        <>
          <hr className="my-4 bg-foreground/30" />
          <h1 className="text-2xl font-bold mb-4 text-foreground/90">
            高级设置
          </h1>
          <div className="bg-muted/50 rounded-2xl p-3">
            <h2 className="font-bold text-foreground/90">管理员设置</h2>
            <hr className="my-2 bg-foreground/30" />
            <h2 className="font-bold text-foreground/90">注册密钥</h2>
            <p className="text-sm text-foreground/80">
              有效期为 {getKeyTTLDisplay()}，且为一次性使用。
            </p>
            <p className="text-sm text-foreground/80">
              当密钥被使用后，需等待上一个密钥过期后才能生成新密钥。
            </p>

            <hr className="my-2 bg-foreground/30" />
            <div className="flex justify-between items-center">
              <Button
                onClick={handleGenerateKey}
                disabled={loadingKey}
                className="flex items-center justify-center gap-2"
              >
                {loadingKey && <Loader2 className="animate-spin w-4 h-4" />}
                <span>{loadingKey ? "生成中" : "生成密钥"}</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* 编辑用户名弹窗 */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>修改用户名</AlertDialogTitle>
            <AlertDialogDescription>
              你可以修改你的用户名。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center gap-2 mt-4">
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="flex-1"
              placeholder="请输入新用户名"
            />
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>关闭</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitName}>
              提交
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 修改密码弹窗 */}
      <AlertDialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowPasswordDialog(false);
            setNewPassword("");
            setConfirmPassword("");
            setPasswordError("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>修改密码</AlertDialogTitle>
            <AlertDialogDescription>
              请输入新密码，密码长度至少6位。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            <Input
              type="password"
              placeholder="新密码"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
            />
            <Input
              type="password"
              placeholder="确认新密码"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError("");
              }}
            />
            {passwordError && (
              <p className="text-red-500 text-sm px-2 py-1 bg-red-50 rounded-md">
                {passwordError}
              </p>
            )}
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <Button
              onClick={async (e) => {
                e.preventDefault(); // 阻止默认行为
                await handleChangePassword();
              }}
              disabled={!newPassword || !confirmPassword}
            >
              提交
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 管理员设置弹窗 */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>设置管理员</AlertDialogTitle>
            <AlertDialogDescription>
              在此添加新的管理员邮箱。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4">
            <Input
              type="email"
              placeholder="管理员邮箱"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogAction onClick={handleAddAdmin}>保存</AlertDialogAction>
            <AlertDialogCancel>关闭</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 注册密钥弹窗 */}
      <AlertDialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>注册密钥</AlertDialogTitle>
            <AlertDialogDescription>
              当前有效的注册密钥，有效期为 {getKeyTTLDisplay()}
              ，且为一次性使用。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="select-all font-['Source_Code_Pro',monospace] text-lg break-all">
                {remainingTime === "已过期" ? "(X^X)" : registerKey.value}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (remainingTime === "已过期") {
                    toast.error("密钥已过期");
                    return;
                  }
                  navigator.clipboard.writeText(registerKey.value);
                  toast.success("已复制到剪贴板");
                }}
                disabled={remainingTime === "已过期"}
              >
                复制密钥
              </Button>
              <span className="text-sm text-muted-foreground">
                {remainingTime ? `剩余时间: ${remainingTime}` : "正在计算..."}
              </span>
            </div>
          </div>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>关闭</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
