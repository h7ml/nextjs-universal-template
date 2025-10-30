"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { ChevronDown, User } from "lucide-react";

// Default test accounts from seed data
const DEFAULT_USERS = [
  {
    email: "admin@example.com",
    password: "admin123",
    label: "管理员",
    role: "admin",
  },
  {
    email: "user@example.com",
    password: "user123",
    label: "测试用户",
    role: "user",
  },
  {
    email: "demo@example.com",
    password: "demo123",
    label: "演示用户",
    role: "user",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check if user is already logged in
  const { data: currentUser } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // Store token
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
      }
      router.push("/dashboard");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      // Store token
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
      }
      router.push("/dashboard");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, username, password, name });
    }
  };

  const handleSelectUser = (user: (typeof DEFAULT_USERS)[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    setError("");
    setShowUserMenu(false);
  };

  // Don't render login form if already logged in (will redirect)
  if (currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-pulse text-muted-foreground">正在跳转...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background page-transition">
      <Card className="w-full max-w-md animate-scale-in shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg" />
        <CardHeader className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
            <CardTitle className="text-2xl">
              {isLogin ? "登录" : "注册"}
            </CardTitle>
          </div>
          <CardDescription>
            {isLogin ? "登录您的账户以继续" : "创建新账户以开始使用"}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {isLogin && (
            <div className="mb-4 pb-4 border-b border-border/40">
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border border-border rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>快速选择测试账号</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>
                {showUserMenu && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg animate-fade-in overflow-hidden">
                    <div className="p-1">
                      {DEFAULT_USERS.map((user, index) => (
                        <button
                          key={user.email}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center justify-between group animate-fade-in-up"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {user.label.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{user.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {user.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    用户名
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    placeholder="username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">姓名</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">邮箱</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="animate-fade-in text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isLogin
                ? loginMutation.isPending
                  ? "登录中..."
                  : "登录"
                : registerMutation.isPending
                  ? "注册中..."
                  : "注册"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-primary hover:underline"
            >
              {isLogin ? "还没有账户？立即注册" : "已有账户？立即登录"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
