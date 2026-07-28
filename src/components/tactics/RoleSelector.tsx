"use client";

import type { Role } from "@/data/types";

export function RoleSelector({
  roles,
  selectedId,
  onSelect,
}: {
  roles: Role[];
  selectedId: string | null;
  onSelect: (roleId: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-black text-white">
        투입 역할 <span className="ml-2 text-xs text-[#9acbff]">모델 입력</span>
      </legend>
      {roles.length === 0 ? (
        <p className="mt-3 rounded-xl border border-[#ff806d]/20 bg-[#ff806d]/7 p-3 text-xs leading-5 text-[#ffab9f]">
          이 포지션 그룹에 사용할 수 있는 역할이 없습니다. 다른 선수를 선택하세요.
        </p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {roles.map((role) => {
            const checked = selectedId === role.roleId;
            return (
              <label
                key={role.roleId}
                className={`cursor-pointer rounded-xl border p-3 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#f4b860] ${
                  checked
                    ? "border-[#f4b860]/60 bg-[#f4b860]/10"
                    : "border-white/[.08] bg-white/[.03] hover:border-white/18"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.roleId}
                  checked={checked}
                  onChange={() => onSelect(role.roleId)}
                  className="sr-only"
                />
                <span className={`text-xs font-black ${checked ? "text-[#f7c979]" : "text-white"}`}>
                  {role.name}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#a8b1bf]">{role.description}</span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
