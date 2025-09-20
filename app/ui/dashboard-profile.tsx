"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Ban, IdCard, Mail, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/ui/dashboard-layout";
import { useUser, useAdminCheck } from "@/contexts/user-context";
import ms from "ms";

export default function DashboardProfile() {
  const { userInfo, logout, refreshUser, isAuthenticated } = useUser();
  const { isAdmin, isSuperAdmin } = useAdminCheck();

  // 编辑用户名相关状态
  const [formName, setFormName] = useState(userInfo?.name || "");
  const [showEditDialog, setShowEditDialog] = useState(false);

  // 修改密码相关状态
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // 更换邮箱相关状态
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  // 邮箱修改加载状态
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // 管理员设置弹窗状态
  const [showAdminDialog, setShowAdminDialog] = useState(false);

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

  // 初始化API开关状态
  const [initApiEnabled, setInitApiEnabled] = useState(true);
  const [loadingInitSetting, setLoadingInitSetting] = useState(false);

  // 所有用户列表
  const [allUsers, setAllUsers] = useState<
    { uid: string; email: string; isAdmin: boolean; isSuperAdmin: boolean }[]
  >([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);

  // 保存原始用户权限状态，用于检测变化
  const [originalUserPermission, setOriginalUserPermission] = useState<
    boolean | null
  >(null);

  // 密钥过期时间倒计时
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
  }, [
    showKeyDialog,
    registerKey.expiresAt,
    currentPassword,
    newEmail,
    refreshUser,
  ]);

  // 同步 userInfo 到本地编辑状态
  useEffect(() => {
    if (userInfo?.name) setFormName(userInfo.name);
    if (userInfo?.email) setNewEmail(userInfo.email);
  }, [userInfo]);

  // 关闭编辑用户名弹窗时重置状态
  useEffect(() => {
    if (!showEditDialog) {
      setFormName(userInfo?.name || "");
      setNewEmail(userInfo?.email || "");
      setCurrentPassword("");
      setEmailError("");
      setIsChangingEmail(false);
    }
  }, [showEditDialog, userInfo]);

  // 关闭密码弹窗清理
  useEffect(() => {
    if (!showPasswordDialog) {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    }
  }, [showPasswordDialog]);

  // 加载所有用户列表
  useEffect(() => {
    const loadUserData = async () => {
      if (usersLoaded) return;

      try {
        const res = await fetch("/api/users", { credentials: "include" });
        if (!res.ok) throw new Error("加载用户列表失败");
        const data = await res.json();
        setAllUsers(data.users || []);
        setUsersLoaded(true);
      } catch (error) {
        toast.error("加载用户数据失败");
        console.error(error);
      }
    };

    loadUserData();
  }, [usersLoaded]);

  // 加载初始化API开关状态
  useEffect(() => {
    const loadInitSetting = async () => {
      if (!isSuperAdmin) return;

      try {
        const res = await fetch("/api/settings/init", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setInitApiEnabled(data.enabled);
        }
      } catch (error) {
        console.error("加载初始化设置失败:", error);
      }
    };

    loadInitSetting();
  }, [isSuperAdmin]);

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

  // 更换邮箱提交
  const handleChangeEmail = async () => {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError("邮箱格式不正确");
      return false;
    }

    // 验证密码不为空
    if (!currentPassword) {
      setEmailError("请输入当前密码");
      return false;
    }

    setIsChangingEmail(true);
    try {
      const res = await fetch("/api/me/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          newEmail: newEmail,
          currentPassword: currentPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "更换邮箱失败");
      }

      toast.success("邮箱更换成功");
      // 刷新用户信息
      await refreshUser();
      return true;
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "更换邮箱失败");
      return false;
    } finally {
      setIsChangingEmail(false);
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

  // 保存用户权限
  async function handleSaveUserPermission() {
    if (!selectedUserUid) {
      toast.error("请选择用户");
      return;
    }

    const user = allUsers.find((u) => u.uid === selectedUserUid);
    if (!user) return;

    try {
      const res = await fetch("/api/users/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: user.email,
          isAdmin: user.isAdmin,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "修改失败");
      }

      const data = await res.json();
      toast.success(data.message);
      setShowAdminDialog(false);

      setSelectedUserUid(null);
      setOriginalUserPermission(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "修改失败");
    }
  }

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

  // 切换初始化API开关
  const handleToggleInitApi = async (enabled: boolean) => {
    setLoadingInitSetting(true);
    try {
      const res = await fetch("/api/settings/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "更新设置失败");
      }

      setInitApiEnabled(enabled);
      toast.success(`初始化 API 已${enabled ? "启用" : "禁用"}`);
    } catch (error) {
      toast.error(
        "更新设置失败: " + (error instanceof Error ? error.message : "")
      );
    } finally {
      setLoadingInitSetting(false);
    }
  };

  if (isAuthenticated === undefined || userInfo === undefined) {
    return null;
  }

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

      {/* 高级设置 - 只有管理员才能看到 */}
      {isAdmin && (
        <>
          <hr className="my-4 bg-foreground/30" />
          <h1 className="text-2xl font-bold mb-4 text-foreground/90">
            高级设置
          </h1>

          <div className="bg-muted/50 rounded-2xl p-3 flex flex-col gap-4">
            {/* 管理员设置 - 只有超级管理员才能看到 */}
            {isSuperAdmin && (
              <>
                {/* 初始化API开关 */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <h2 className="font-bold text-foreground/90">初始化 API</h2>
                    <p className="text-sm text-foreground/70">
                      控制系统初始化 API 的启用状态。禁用后将无法通过 API 创建管理员账号。
                    </p>
                  </div>
                  <Button
                    onClick={() => handleToggleInitApi(!initApiEnabled)}
                    disabled={loadingInitSetting}
                    variant={initApiEnabled ? "destructive" : "default"}
                    className="flex items-center justify-center gap-2"
                  >
                    {loadingInitSetting && (
                      <Loader2 className="animate-spin w-4 h-4" />
                    )}
                    <span>
                      {loadingInitSetting
                        ? "更新中"
                        : initApiEnabled
                        ? "禁用接口"
                        : "启用接口"}
                    </span>
                  </Button>
                </div>

                {/* 设置管理员权限 */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <h2 className="font-bold text-foreground/90">管理员设置</h2>
                    <p className="text-sm text-foreground/70">
                      为其他用户设置管理员权限。
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAdminDialog(true)}
                    className="flex items-center justify-center gap-2"
                  >
                    设置权限
                  </Button>
                </div>
              </>
            )}

            {/* 注册密钥 */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <h2 className="font-bold text-foreground/90">注册密钥</h2>
                <p className="text-sm text-foreground/70">
                  有效期为 {getKeyTTLDisplay()}
                  。当密钥被使用后，需等待上一个密钥过期后才能生成新密钥。
                </p>
              </div>
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
            <AlertDialogTitle>编辑信息</AlertDialogTitle>
            <AlertDialogDescription>
              你可以修改你的用户名和邮箱。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 mt-4">
            {/* 用户名输入 */}
            <div>
              <Label className="text-sm font-medium text-foreground/90 mb-2 block">
                用户名
              </Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="请输入新用户名"
              />
            </div>

            {/* 邮箱输入 */}
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground/90 mb-2 block"
              >
                邮箱
              </Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="请输入新邮箱"
              />
            </div>

            {/* 当前密码输入（更换邮箱时需要） */}
            {newEmail && newEmail !== userInfo?.email && (
              <div>
                <Label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-foreground/90 mb-2 block"
                >
                  当前密码
                </Label>
                <p className="text-sm text-foreground/70 mb-2">
                  为了保护您的账号安全，更换邮箱需要验证当前密码。请在下方输入您的登录密码。
                </p>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="更换邮箱需要验证当前密码"
                />
              </div>
            )}

            {/* 错误提示 */}
            {emailError && (
              <p className="text-red-500 text-sm px-2 py-1 bg-red-50 rounded-md">
                {emailError}
              </p>
            )}
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>关闭</AlertDialogCancel>
            <Button
              disabled={
                // 检查是否有任何内容发生变化或正在加载
                (formName.trim() === (userInfo?.name || "") &&
                  newEmail === (userInfo?.email || "")) ||
                isChangingEmail
              }
              onClick={async (e) => {
                e.preventDefault(); // 阻止默认行为

                // 清除之前的错误信息
                setEmailError("");

                // 如果邮箱有变化，先处理邮箱更换
                if (newEmail && newEmail !== userInfo?.email) {
                  const emailSuccess = await handleChangeEmail();
                  if (!emailSuccess) return; // 邮箱验证失败，停止提交
                }

                // 处理用户名更新
                if (formName.trim() !== userInfo?.name) {
                  await handleSubmitName();
                } else {
                  // 如果用户名没有变化且邮箱也没有变化，直接关闭弹窗
                  setShowEditDialog(false);
                }
              }}
            >
              {isChangingEmail && <Loader2 className="animate-spin w-4 h-4" />}
              {isChangingEmail ? "验证中" : "提交"}
            </Button>
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
            <Label>新密码</Label>
            <Input
              type="password"
              placeholder="请输入新密码"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
            />
            <Label>确认密码</Label>
            <Input
              type="password"
              placeholder="请确认密码"
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
              选择一个用户并修改账号权限。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 flex items-center gap-4 flex-wrap">
            {/* 左侧用户选择 */}
            <Select
              value={selectedUserUid || ""}
              onValueChange={(val) => {
                setSelectedUserUid(val);
                // 保存选中用户的原始权限状态
                const selectedUser = allUsers.find((u) => u.uid === val);
                setOriginalUserPermission(selectedUser?.isAdmin || false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择用户" />
              </SelectTrigger>
              <SelectContent>
                {allUsers
                  .filter((u) => u.email !== userInfo.email && !u.isSuperAdmin)
                  .map((user) => (
                    <SelectItem key={user.uid} value={user.uid}>
                      {user.email}{" "}
                      <span>
                        {user.isAdmin ? (
                          <span className="text-ms text-primary/90">
                            (管理员)
                          </span>
                        ) : (
                          <span className="text-ms text-foreground/40">
                            (普通用户)
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* 右侧权限选择 */}
            <Select
              value={
                selectedUserUid
                  ? allUsers.find((u) => u.uid === selectedUserUid)?.isAdmin
                    ? "true"
                    : "false"
                  : ""
              }
              onValueChange={(val) => {
                if (!selectedUserUid) return;
                setAllUsers((prev) =>
                  prev.map((u) =>
                    u.uid === selectedUserUid
                      ? { ...u, isAdmin: val === "true" }
                      : u
                  )
                );
              }}
            >
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="请选择权限" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">普通用户</SelectItem>
                <SelectItem value="true">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>关闭</AlertDialogCancel>
            <Button
              disabled={
                // 检查是否选择了用户且权限发生了变化
                !selectedUserUid ||
                originalUserPermission === null ||
                (selectedUserUid &&
                  allUsers.find((u) => u.uid === selectedUserUid)?.isAdmin) ===
                  originalUserPermission
              }
              onClick={(e) => {
                e.preventDefault(); // 阻止默认行为
                handleSaveUserPermission();
              }}
            >
              保存
            </Button>
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
              <br />
              当密钥被使用后，需等待上一个密钥过期后才能生成新密钥。
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
