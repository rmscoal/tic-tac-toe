export default function Center({ children, className }) {
  return <div className={`flex justify-center place-content-center items-center ${className}`}>{children}</div>;
}
