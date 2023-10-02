export default function Center({ children, className }) {
  return <div className={`flex justify-center place-content-center ${className}`}>{children}</div>;
}
