"use client";

import React from "react";
import { ReactNode, ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const input = tv({
  base: "w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-700",
  variants: {
    border: {
      normal: "border-gray-300 ",
      hoverOnly:
        "border-transparent bg-transparent hover:border-gray-300 focus:ring-inset",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    readOnly: {
      true: "cursor-default bg-gray-100 text-gray-500 focus:border-gray-300 focus:ring-0",
    },
    error: {
      true: "border-red-500 focus:border-red-500 focus:ring-red-500",
    },
  },
  defaultVariants: {
    border: "normal",
    disabled: false,
    isBusy: false,
    readOnly: false,
    error: false,
  },
});

interface Props
  extends Omit<ComponentPropsWithRef<"input">, "className">,
    VariantProps<typeof input> {
  ref: React.Ref<HTMLInputElement>;
  children?: ReactNode;
  className?: string;
  isBusy?: boolean;
  readOnly?: boolean;
  error?: boolean;
  border?: "normal" | "hoverOnly";
}

export const TextInputField = (props: Props) => {
  const { ref, disabled, className, readOnly, error, isBusy, border, ...rest } =
    props;

  return (
    <input
      ref={ref}
      className={input({ border, disabled, readOnly, error, class: className })}
      disabled={disabled || isBusy}
      readOnly={readOnly}
      type="text"
      {...rest}
    />
  );
};
