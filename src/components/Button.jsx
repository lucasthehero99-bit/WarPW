import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      className={`tw-btn tw-btn--${variant} tw-btn--${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
