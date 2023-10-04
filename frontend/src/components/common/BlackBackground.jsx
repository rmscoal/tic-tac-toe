export default function BlackBackground({ children, className }) {
  return <div className={`dark-bg ${className}`}>{children}</div>;
}
