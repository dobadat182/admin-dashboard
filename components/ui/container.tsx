import React from "react";

type Props = {
  children: React.ReactNode;
};

export function Container({ children }: Props) {
  return <div className="mx-auto h-full w-full max-w-360 px-4 md:px-6 print:px-0!">{children}</div>;
}
