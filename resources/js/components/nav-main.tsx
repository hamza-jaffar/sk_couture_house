"use client"

import { Link, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

type NavMainItemData = {
  title: string
  url: string
  icon: React.ReactNode
  items?: {
    title: string
    url: string
  }[]
}

function normalizePath(url: string): string {
  const path = url.split(/[?#]/, 1)[0].replace(/\/+$/, "")

  return path || "/"
}

function isPathActive(url: string, currentUrl: string): boolean {
  if (!url || url === "#") {
    return false
  }

  const targetPath = normalizePath(url)
  const currentPath = normalizePath(currentUrl)

  return (
    currentPath === targetPath ||
    currentPath.startsWith(`${targetPath}/`)
  )
}

function NavMainItem({
  item,
  currentUrl,
}: {
  item: NavMainItemData
  currentUrl: string
}) {
  const hasChildren = Boolean(item.items?.length)
  const hasActiveChild =
    item.items?.some((subItem) => isPathActive(subItem.url, currentUrl)) ?? false
  const isCurrentPage = isPathActive(item.url, currentUrl)
  const [isOpen, setIsOpen] = useState(hasActiveChild)

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [hasActiveChild])

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      render={<SidebarMenuItem />}
    >
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isCurrentPage || (hasActiveChild && !isOpen)}
        render={
          hasChildren ? (
            <CollapsibleTrigger />
          ) : (
            <Link href={item.url} />
          )
        }
      >
        {item.icon}
        <span>{item.title}</span>
        {hasChildren ? (
          <ChevronRightIcon className="ml-auto transition-transform group-aria-expanded/menu-button:rotate-90" />
        ) : null}
      </SidebarMenuButton>
      {hasChildren ? (
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  isActive={isPathActive(subItem.url, currentUrl)}
                  render={<Link href={subItem.url} />}
                >
                  <span>{subItem.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  )
}

export function NavMain({
  items,
}: {
  items: NavMainItemData[]
}) {
  const currentUrl = usePage().url

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMainItem
            key={item.title}
            item={item}
            currentUrl={currentUrl}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
