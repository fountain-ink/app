"use client"

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Badge,
  badgeVariants,
} from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Button,
  buttonVariants,
} from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import {
  Checkbox,
} from "@/components/ui/checkbox"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Input,
} from "@/components/ui/input"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useForm, useFormContext } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
 
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})
 
export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })
 
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}


export default function ComponentsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null)
  const [isHoverCardOpen, setIsHoverCardOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const form = useForm()
	

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">UI Components</h1>

      <h2 className="text-2xl font-bold mb-2">Accordion</h2>
      <Accordion type="multiple">
        <AccordionItem value={"1"}>
          <AccordionTrigger>Accordion Item 1</AccordionTrigger>
          <AccordionContent>
            Content for Accordion Item 1
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value={'2'}>
          <AccordionTrigger>Accordion Item 2</AccordionTrigger>
          <AccordionContent>
            Content for Accordion Item 2
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-2xl font-bold mb-2">Alert</h2>
      <Alert>
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>
          This is a default alert message.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Destructive Alert</AlertTitle>
        <AlertDescription>
          This is a destructive alert message.
        </AlertDescription>
      </Alert>

      <h2 className="text-2xl font-bold mb-2">AlertDialog</h2>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button>Open AlertDialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <h2 className="text-2xl font-bold mb-2">Avatar</h2>
      <Avatar>
        <AvatarImage src="https://placehold.co/600x400" alt="Avatar" />
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <span className="text-lg font-bold">A</span>
        </AvatarFallback>
      </Avatar>

      <h2 className="text-2xl font-bold mb-2">Badge</h2>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>

      <h2 className="text-2xl font-bold mb-2">Breadcrumb</h2>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Product Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Product Details</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Product Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="text-2xl font-bold mb-2">Button</h2>
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">Icon</Button>

      <h2 className="text-2xl font-bold mb-2">Card</h2>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>
            This is a card description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          Card content goes here.
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </Card>

      <h2 className="text-2xl font-bold mb-2">Checkbox</h2>
      <Checkbox checked={checked} onChange={() => setChecked(!checked)} />

      <h2 className="text-2xl font-bold mb-2">Command</h2>
      <CommandDialog open={isCommandDialogOpen} onOpenChange={setIsCommandDialogOpen}>
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandGroup title="Recent">
              <CommandItem onSelect={() => setIsCommandDialogOpen(false)}>
                Recent Item 1
                <CommandShortcut>Ctrl+Shift+1</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setIsCommandDialogOpen(false)}>
                Recent Item 2
                <CommandShortcut>Ctrl+Shift+2</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup title="Files">
              <CommandItem onSelect={() => setIsCommandDialogOpen(false)}>
                File 1
                <CommandShortcut>Ctrl+Shift+3</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setIsCommandDialogOpen(false)}>
                File 2
                <CommandShortcut>Ctrl+Shift+4</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandEmpty>No results found.</CommandEmpty>
          </CommandList>
        </Command>
      </CommandDialog>
      <Button onClick={() => setIsCommandDialogOpen(true)}>
        Open Command Dialog
      </Button>

      <h2 className="text-2xl font-bold mb-2">ContextMenu</h2>
      <ContextMenu>
        <ContextMenuTrigger>
          <Button>Open Context Menu</Button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => console.log("Item 1 selected")}>
            Item 1
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => console.log("Item 2 selected")}>
            Item 2
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Label</ContextMenuLabel>
          <ContextMenuItem onSelect={() => console.log("Item 3 selected")}>
            Item 3
          </ContextMenuItem>
          <ContextMenuCheckboxItem
            checked={checked}
            onChange={() => setChecked(!checked)}
          >
            Checkbox Item
          </ContextMenuCheckboxItem>
          <ContextMenuRadioGroup
            value={selectedRadio || ""}
            onValueChange={setSelectedRadio}
          >
            <ContextMenuRadioItem value="radio-1">Radio 1</ContextMenuRadioItem>
            <ContextMenuRadioItem value="radio-2">Radio 2</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Submenu</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onSelect={() => console.log("Submenu Item 1 selected")}>
                Submenu Item 1
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => console.log("Submenu Item 2 selected")}>
                Submenu Item 2
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>

      <h2 className="text-2xl font-bold mb-2">Dialog</h2>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>
              This is a dialog description.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h2 className="text-2xl font-bold mb-2">DropdownMenu</h2>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button>Open Dropdown Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => console.log("Item 1 selected")}>
            Item 1
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => console.log("Item 2 selected")}>
            Item 2
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => console.log("Item 3 selected")}>
            Item 3
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem
            checked={checked}
            onChange={() => setChecked(!checked)}
          >
            Checkbox Item
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup
            value={selectedRadio || ""}
            onValueChange={setSelectedRadio}
          >
            <DropdownMenuRadioItem value="radio-1">Radio 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="radio-2">Radio 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={() => console.log("Submenu Item 1 selected")}>
                Submenu Item 1
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Submenu Item 2 selected")}>
                Submenu Item 2
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <h2 className="text-2xl font-bold mb-2">Form</h2>
      <ProfileForm />

      <h2 className="text-2xl font-bold mb-2">HoverCard</h2>
      <HoverCard open={isHoverCardOpen} onOpenChange={setIsHoverCardOpen}>
        <HoverCardTrigger asChild>
          <Button>Open Hover Card</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          Hover card content goes here.
        </HoverCardContent>
      </HoverCard>

      <h2 className="text-2xl font-bold mb-2">Input</h2>
      <Input type="text" placeholder="Enter text" />

      <h2 className="text-2xl font-bold mb-2">Drawer</h2>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button>Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>
              This is a drawer description.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={() => setIsDrawerOpen(false)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
