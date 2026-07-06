import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "secondary";

type ButtonProps = {
	variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
	variant = "primary",
	className = "",
	...props
}: ButtonProps) {
	return (
		<button className={`button button--${variant} ${className}`} {...props} />
	);
}
