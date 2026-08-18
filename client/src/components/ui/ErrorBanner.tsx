type ErrorBannerProps = {
  message: string;
  className?: string;
};

const ErrorBanner = ({ message, className }: ErrorBannerProps) => {
  return <div className={`rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ${className ?? ""}`}>{message}</div>;
};

export default ErrorBanner;