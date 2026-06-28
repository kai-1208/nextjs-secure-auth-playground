import React from "react";
import { ReactNode, ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const button = tv({
  base: "flex items-center justify-center rounded-md px-4 py-2 font-bold text-white transition-colors focus:outline-none focus:ring-2",
  variants: {
    variant: {
      indigo: "bg-indigo-400 hover:bg-indigo-600 focus:ring-indigo-200",
    },
    width: {
      auto: "",
      stretch: "w-full",
      slim: "px-3 py-1",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    isBusy: {
      true: "cursor-wait opacity-50",
    },
  },
  defaultVariants: {
    variant: "indigo",
    width: "auto",
    disabled: false,
    isBusy: false,
  },
});

interface Props
  extends Omit<ComponentPropsWithRef<"button">, "className">,
    VariantProps<typeof button> {
  children?: ReactNode;
  className?: string;
  isBusy?: boolean;
}

export const Button = (props: Props) => {
  const { children, variant, width, disabled, isBusy, className, ...rest } =
    props;

  return (
    <button
      className={button({ variant, width, disabled, isBusy, class: className })}
      disabled={disabled || isBusy}
      {...rest}
    >
      <div>
        {isBusy && (
          <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
        )}
        {children}
        {isBusy && <span>中...</span>}
      </div>
    </button>
  );
};
