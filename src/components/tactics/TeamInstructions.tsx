"use client";

import type {
  InstructionCategory,
  TacticalInstructions,
} from "@/data/types";

export function TeamInstructions({
  categories,
  values,
  onChange,
}: {
  categories: InstructionCategory[];
  values: TacticalInstructions;
  onChange: (category: keyof TacticalInstructions, value: string) => void;
}) {
  return (
    <section aria-labelledby="instruction-title">
      <div className="flex items-center justify-between">
        <h2 id="instruction-title" className="text-sm font-black text-white">팀 지시</h2>
        <span className="text-[10px] font-bold text-[#748091]">선택 즉시 재계산</span>
      </div>
      <div className="mt-3 grid gap-4">
        {categories.map((category) => {
          const selectedOption = category.options.find(
            (option) => values[category.id] === option.id,
          );
          return (
            <fieldset key={category.id}>
              <legend className="mb-2 text-[10px] font-black tracking-[.08em] text-[#8f99a8]">
                {category.label}
              </legend>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {category.options.map((option) => {
                  const selected = values[category.id] === option.id;
                  const descriptionId = `${category.id}-${option.id}-description`;
                  return (
                    <label
                      key={option.id}
                      title={option.description}
                      className={`cursor-pointer rounded-lg border px-2 py-2.5 text-center text-[10px] font-black transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#75b9ff] ${
                        selected
                          ? "border-[#75b9ff]/50 bg-[#75b9ff]/12 text-[#a9d2ff]"
                          : "border-white/[.07] bg-white/[.025] text-[#8c97a6] hover:border-white/16"
                      }`}
                    >
                      <input
                        type="radio"
                        name={category.id}
                        value={option.id}
                        checked={selected}
                        aria-describedby={descriptionId}
                        onChange={() => onChange(category.id, option.id)}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
              <div className="sr-only">
                {category.options.map((option) => (
                  <span
                    key={option.id}
                    id={`${category.id}-${option.id}-description`}
                  >
                    {option.description}
                  </span>
                ))}
              </div>
              <p
                aria-live="polite"
                className="mt-2 min-h-8 text-[10px] leading-4 text-[#9ba5b2]"
              >
                {selectedOption?.description}
              </p>
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}
