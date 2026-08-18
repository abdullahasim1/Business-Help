import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

const PageContainer = ({ children, className = "" }: PageContainerProps) => {
  return <div className={`mx-auto w-full max-w-7xl px-5 py-6 md:px-8 md:py-8 ${className}`}>{children}</div>;
};

export default PageContainer;
