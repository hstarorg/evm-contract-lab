import type { PropsWithChildren } from 'react';

export type PageContentProps = {
  loaded?: boolean;
  empty?: boolean;
};
export function PageContent({
  loaded,
  empty,
  children,
}: PropsWithChildren<PageContentProps>) {
  if (!loaded) {
    return <div className="text-center">Data loading...</div>;
  }
  if (empty) {
    return <div className="text-center py-12">No data available</div>;
  }
  return children;
}
