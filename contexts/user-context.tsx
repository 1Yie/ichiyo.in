"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import md5 from "md5";
import { request } from "@/hooks/use-request";

export interface UserInfo {
    name: string;
    email: string;
    avatar: string;
    isAdmin?: boolean;
}

interface UserContextType {
    userInfo: UserInfo | null;
    loading: boolean;
    error: string | null;
    fetchUser: () => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

const USER_CACHE_KEY = 'user_info_cache';
const CACHE_DURATION = 10 * 60 * 1000;

const getCachedUser = (): UserInfo | null => {
    if (typeof window === 'undefined') return null;

    try {
        const cached = localStorage.getItem(USER_CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            } else {
                localStorage.removeItem(USER_CACHE_KEY);
            }
        }
    } catch (error) {
        console.error('读取用户缓存失败:', error);
        localStorage.removeItem(USER_CACHE_KEY);
    }
    return null;
};

const setCachedUser = (userData: UserInfo) => {
    if (typeof window === 'undefined') return;

    try {
        const cacheData = {
            data: userData,
            timestamp: Date.now()
        };
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('缓存用户数据失败:', error);
    }
};

const clearCachedUser = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_CACHE_KEY);
};

interface UserProviderProps {
    children: ReactNode;
    redirectOnAuth?: boolean;
}

export function UserProvider({
    children,
}: UserProviderProps) {

    const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
        return getCachedUser();
    });

    const [loading, setLoading] = useState(() => {
        return !getCachedUser();
    });

    const [error, setError] = useState<string | null>(null);

    const fetchUser = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            const res = await fetch("/api/me", {
                credentials: "include",
                cache: 'no-cache'
            });

            if (res.ok) {
                const data = await res.json();

                if (data.authenticated && data.user) {
                    const email = data.user.email || "unknown@example.com";
                    const name = data.user.id || data.user.name || "用户";
                    const emailHash = md5(email.trim().toLowerCase());
                    const gravatarUrl = `https://dn-qiniu-avatar.qbox.me/avatar/${emailHash}?d=identicon`;

                    const userData: UserInfo = {
                        name,
                        email,
                        avatar: gravatarUrl,
                        isAdmin: data.user.isAdmin || false,
                    };

                    setUserInfo(userData);
                    setCachedUser(userData);
                } else {
                    setUserInfo(null);
                    clearCachedUser();
                    
                    // if (redirectOnAuth) {
                    //     const currentPath = window.location.pathname;
                    //     const protectedPaths = ['/dashboard', '/admin', '/profile'];
                    //     if (protectedPaths.some(path => currentPath.startsWith(path))) {
                    //         router.replace("/login");
                    //     }
                    // }
                }
            } else if (res.status === 401) {
                setUserInfo(null);
                clearCachedUser();
                
                // // 同样的逻辑
                // if (redirectOnAuth) {
                //     const currentPath = window.location.pathname;
                //     const protectedPaths = ['/dashboard', '/admin', '/profile'];
                //     if (protectedPaths.some(path => currentPath.startsWith(path))) {
                //         router.replace("/login");
                //     }
                // }
            } else {
                throw new Error(`请求失败: ${res.status}`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
            console.error('获取用户信息失败:', err);
            setError(errorMessage);

            if (!userInfo) {
                setUserInfo(null);
                clearCachedUser();

                // if (redirectOnAuth) {
                //     const currentPath = window.location.pathname;
                //     const protectedPaths = ['/dashboard', '/admin', '/profile'];
                //     if (protectedPaths.some(path => currentPath.startsWith(path))) {
                //         router.replace("/login");
                //     }
                // }
            }
        } finally {
            setLoading(false);
        }
    };

    // 修正的登出方法
    const logout = async () => {
        try {
            setLoading(true);

            await request("/api/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error('登出请求失败:', error);
        } finally {
            // 清除用户状态和缓存
            setUserInfo(null);
            clearCachedUser();
            setError(null);
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        await fetchUser(false);
    };

    useEffect(() => {
        if (!userInfo) {
            fetchUser();
        }
    }, []);

    const contextValue: UserContextType = {
        userInfo,
        loading,
        error,
        fetchUser,
        logout,
        refreshUser,
        isAuthenticated: !!userInfo,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error('useUser 必须在 UserProvider 内部使用');
    }

    return context;
}

export function useAdminCheck() {
    const { userInfo, isAuthenticated } = useUser();
    
    return {
        isAdmin: isAuthenticated && userInfo?.isAdmin === true,
        isAuthenticated,
        userInfo,
    };
}