"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { mainNav, servicesMenuAll } from "@/content/navigation"
import { services } from "@/content/services"
import { cn } from "@/lib/utils"

/** `href` идэвхтэй эсэх: "/" зөвхөн яг таарвал, бусад нь угтвараар. */
export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

export function serviceIcon(href: string) {
  return services.find((service) => `/services/${service.slug}` === href)?.icon
}

const activeClass = "text-primary bg-accent/60 dark:bg-accent/40"

export function NavLinks() {
  const pathname = usePathname()

  return (
    <NavigationMenu viewport={false} aria-label="Үндсэн цэс">
      <NavigationMenuList className="gap-0.5">
        {mainNav.map((item) => {
          const active = isActivePath(pathname, item.href)

          if (item.children) {
            return (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuTrigger className={cn(active && activeClass)}>{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-popover text-popover-foreground">
                  <ul className="grid w-[420px] gap-1 p-1">
                    {item.children.map((child) => {
                      const Icon = serviceIcon(child.href)
                      const childActive = isActivePath(pathname, child.href)
                      return (
                        <li key={child.href}>
                          <NavigationMenuLink asChild active={childActive}>
                            <Link href={child.href} className="items-start gap-3 p-3">
                              {Icon && (
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                  <Icon className="size-4.5" aria-hidden />
                                </span>
                              )}
                              <span className="flex flex-col gap-0.5">
                                <span className="font-medium text-foreground">{child.label}</span>
                                <span className="text-xs text-muted-foreground">{child.description}</span>
                              </span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      )
                    })}
                    <li className="mt-1 border-t pt-1">
                      <NavigationMenuLink asChild>
                        <Link href={item.href} className="justify-between p-3 text-sm font-medium text-primary">
                          {servicesMenuAll}
                          <span aria-hidden>→</span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          }

          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild active={active}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(navigationMenuTriggerStyle(), active && activeClass)}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
