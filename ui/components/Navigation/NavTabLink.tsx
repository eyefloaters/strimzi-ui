"use client";
import {
  Tabs,
  Tab,
  TabTitleText,
  TabsComponent,
} from "@/libs/patternfly/react-core";
import { usePathname, useRouter } from "@/i18n/routing";
import { Route } from "next";

type TabData<T extends string> = {
  key: number | string;
  title: React.ReactNode;
  url: Route<T> | URL;
};

export function NavTabLink<T extends string>({ tabs }: { tabs: TabData<T>[] }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTabKey =
    tabs.find((tab) => pathname === tab.url.toString())?.key ??
    tabs.find((tab) => pathname.startsWith(tab.url.toString()))?.key ??
    0;

  const handleTabClick = (url: Route<T> | URL) => (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default link navigation
    router.push(url.toString()); // Trigger Next.js navigation
  };

  return (
    <Tabs
      activeKey={activeTabKey}
      aria-label="Node navigation"
      component={TabsComponent.nav}
    >
      {tabs.map(({ key, title, url }) => (
        <Tab
          key={key}
          eventKey={key}
          title={<TabTitleText>{title}</TabTitleText>}
          href={url.toString()}
          onClick={handleTabClick(url)}
        />
      ))}
    </Tabs>
  );
}
