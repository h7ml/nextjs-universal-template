"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  Mail,
  User as UserIcon,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  X,
  Lock,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@/db/schema";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    username: "",
    isActive: true,
    emailVerified: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.user.getById.useQuery(
    { id },
    {
      enabled: !!id,
      retry: false,
    }
  );

  // Get current user to check if admin
  const { data: currentUser } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Update mutation
  const updateMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      alert(`更新失败: ${error.message}`);
    },
  });

  // Change password mutations
  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("密码修改成功");
    },
    onError: (error) => {
      alert(`密码修改失败: ${error.message}`);
    },
  });

  const changePasswordByAdminMutation =
    trpc.user.changePasswordByAdmin.useMutation({
      onSuccess: () => {
        setIsChangingPassword(false);
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        alert("密码修改成功");
      },
      onError: (error) => {
        alert(`密码修改失败: ${error.message}`);
      },
    });

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser && currentUser.id === id;
  // Check if current user is admin (can use admin methods)
  const isAdmin = !!currentUser; // For now, we'll check this based on API access

  // Initialize form when user data is loaded
  useEffect(() => {
    if (user && !isEditing) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        isActive: user.isActive ?? true,
        emailVerified: user.emailVerified ?? false,
      });
    }
  }, [user, isEditing]);

  const handleEdit = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        isActive: user.isActive ?? true,
        emailVerified: user.emailVerified ?? false,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!id) return;

    updateMutation.mutate({
      id,
      ...editForm,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        isActive: user.isActive ?? true,
        emailVerified: user.emailVerified ?? false,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2">用户未找到</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message || "该用户不存在或您没有访问权限"}
            </p>
            <Button asChild>
              <Link href="/users">返回用户列表</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 page-transition">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div className="inline-block mb-2">
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user.name || user.username}
              </h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {currentUser && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setIsChangingPassword(false);
                    handleEdit();
                  }}
                  disabled={isEditing || isChangingPassword}
                >
                  <Edit className="h-4 w-4" />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setIsEditing(false);
                    setIsChangingPassword(true);
                  }}
                  disabled={isEditing || isChangingPassword}
                >
                  <Lock className="h-4 w-4" />
                  修改密码
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      {isChangingPassword && (
        <Card className="animate-fade-in-up mb-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {isOwnProfile ? "修改我的密码" : "修改用户密码"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {isOwnProfile
                ? "请先输入当前密码，然后输入新密码"
                : "作为管理员，您可以直接设置新密码，无需输入旧密码"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isOwnProfile && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  当前密码
                </label>
                <Input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  placeholder="请输入当前密码"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">新密码</label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder="请输入新密码（至少8个字符）"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                确认新密码
              </label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="请再次输入新密码"
                minLength={8}
                required
              />
              {passwordForm.newPassword &&
                passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    两次输入的密码不一致
                  </p>
                )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  if (
                    !passwordForm.newPassword ||
                    passwordForm.newPassword.length < 8
                  ) {
                    alert("新密码长度至少为8个字符");
                    return;
                  }
                  if (
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  ) {
                    alert("两次输入的密码不一致");
                    return;
                  }

                  if (isOwnProfile) {
                    if (!passwordForm.oldPassword) {
                      alert("请输入当前密码");
                      return;
                    }
                    changePasswordMutation.mutate({
                      oldPassword: passwordForm.oldPassword,
                      newPassword: passwordForm.newPassword,
                    });
                  } else {
                    // Admin changing password for another user
                    if (!id) return;
                    changePasswordByAdminMutation.mutate({
                      userId: id,
                      newPassword: passwordForm.newPassword,
                    });
                  }
                }}
                disabled={
                  changePasswordMutation.isPending ||
                  changePasswordByAdminMutation.isPending ||
                  !passwordForm.newPassword ||
                  passwordForm.newPassword.length < 8 ||
                  passwordForm.newPassword !== passwordForm.confirmPassword ||
                  (isOwnProfile && !passwordForm.oldPassword)
                }
                className="flex-1"
              >
                {changePasswordMutation.isPending ||
                changePasswordByAdminMutation.isPending
                  ? "修改中..."
                  : "修改密码"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {isEditing && (
        <Card className="animate-fade-in-up mb-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                编辑用户信息
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>更新用户的基本信息和状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">姓名</label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="姓名"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">邮箱</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">用户名</label>
                <Input
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  placeholder="username"
                  minLength={3}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="flex items-center gap-6 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">账户活跃</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.emailVerified}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      emailVerified: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">邮箱已验证</span>
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? "保存中..." : "保存更改"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card className="animate-fade-in-up stagger-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">用户名</div>
              <div className="font-medium">{user.username}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">姓名</div>
              <div className="font-medium">{user.name || "未设置"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">邮箱</div>
              <div className="font-medium flex items-center gap-2">
                {user.email}
                {user.emailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Permissions */}
        <Card className="animate-fade-in-up stagger-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              状态与权限
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">账户状态</div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  user.isActive
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {user.isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    活跃
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    已禁用
                  </>
                )}
              </span>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                邮箱验证状态
              </div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  user.emailVerified
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                {user.emailVerified ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    已验证
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    未验证
                  </>
                )}
              </span>
            </div>
            {user.roleId && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  角色 ID
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {user.roleId}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="animate-fade-in-up stagger-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              活动信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">注册时间</div>
              <div className="font-medium">
                {new Date(user.createdAt).toLocaleString("zh-CN")}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">最后更新</div>
              <div className="font-medium">
                {new Date(user.updatedAt).toLocaleString("zh-CN")}
              </div>
            </div>
            {user.lastLoginAt && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  最后登录
                </div>
                <div className="font-medium">
                  {new Date(user.lastLoginAt).toLocaleString("zh-CN")}
                </div>
              </div>
            )}
            {!user.lastLoginAt && (
              <div className="text-sm text-muted-foreground italic">
                从未登录
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="animate-fade-in-up stagger-1">
          <CardHeader>
            <CardTitle>账户详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">用户 ID</div>
              <div className="font-mono text-xs text-muted-foreground break-all">
                {user.id}
              </div>
            </div>
            {user.avatar && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">头像</div>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar}
                    alt={user.name || user.username}
                    className="h-16 w-16 rounded-full object-cover border-2 border-border"
                  />
                  <a
                    href={user.avatar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    查看原图
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>统计摘要</CardTitle>
          <CardDescription>用户的账户相关信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {user.isActive ? "✓" : "✗"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">账户状态</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {user.emailVerified ? "✓" : "✗"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">邮箱验证</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {user.lastLoginAt ? "✓" : "✗"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">登录历史</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {user.roleId ? "✓" : "✗"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">角色分配</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
