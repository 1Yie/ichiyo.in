import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  revealable?: boolean;
}

function isWebkitTextSecuritySupported() {
  if (typeof document === "undefined") return false;
  const input = document.createElement("input");
  return "webkitTextSecurity" in input.style;
}

const MASK_CHAR = "\u25CF";

export function SecretInput({
  className,
  revealable = true,
  placeholder,
  value,
  onChange,
  style,
  ...props
}: SecretInputProps) {
  const [show, setShow] = useState(false);
  const [webkitSupported, setWebkitSupported] = useState(false);

  // 维护真实值和掩码值
  const [realValue, setRealValue] = useState(value?.toString() || "");
  const [maskedValue, setMaskedValue] = useState(
    value ? MASK_CHAR.repeat(value.toString().length) : ""
  );

  // 是否聚焦，用于控制自定义 placeholder 显示
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setWebkitSupported(isWebkitTextSecuritySupported());
  }, []);

  // 同步外部 value 到内部
  useEffect(() => {
    if (value !== undefined && value !== realValue) {
      const valStr = value?.toString() || "";
      setRealValue(valStr);
      setMaskedValue(MASK_CHAR.repeat(valStr.length));
    }
  }, [value, realValue]);

  // 禁止粘贴
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  // 处理输入事件
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (webkitSupported) {
      if (onChange) {
        onChange(e);
      }
      return;
    }

    const val = e.target.value;
    const oldMasked = maskedValue;

    let newRealValue = realValue;

    if (val.length > oldMasked.length) {
      const added = val.slice(oldMasked.length);
      newRealValue += added;
    } else if (val.length < oldMasked.length) {
      newRealValue = realValue.slice(0, val.length);
    }

    setRealValue(newRealValue);
    setMaskedValue(MASK_CHAR.repeat(val.length));

    if (onChange) {
      const event = {
        ...e,
        target: {
          ...e.target,
          value: newRealValue,
        },
      };
      onChange(event as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="relative w-full">
      {/* 输入框 */}
      <input
        {...props}
        type="text"
        autoComplete="off"
        className={cn(
          "file:text-foreground placeholder:text-transparent selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          !webkitSupported && !show && "mask-char",
          className
        )}
        style={
          webkitSupported
            ? ({
                ...(style || {}),
                WebkitTextSecurity: show ? "none" : "disc",
              } as React.CSSProperties)
            : style || {}
        }
        value={webkitSupported ? value || "" : show ? realValue : maskedValue}
        onChange={handleChange}
        onPaste={webkitSupported ? props.onPaste : handlePaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="" // 隐藏原生 placeholder
      />

      {/* 自定义 placeholder */}
      {!focused && (realValue.length === 0 || !value) && placeholder && (
        <div
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm text-muted-foreground"
          style={{
            userSelect: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {placeholder}
        </div>
      )}

      {/* 显示/隐藏切换按钮 */}
      {revealable && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          tabIndex={-1}
          aria-label={show ? "隐藏密钥" : "显示密钥"}
        >
          {show ? (
            <EyeOff className="h-4 w-4 cursor-pointer" />
          ) : (
            <Eye className="h-4 w-4 cursor-pointer" />
          )}
        </button>
      )}
    </div>
  );
}
