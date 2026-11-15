import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { FaqItem } from "@/types/content"

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger className="text-start text-base">{item.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
