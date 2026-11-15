import { BookOpen, Building2, FileBarChart, FlaskConical, RefreshCw } from "lucide-react"

import type { FlowStage } from "@/types/content"

// docs/brief/process-diagram.png-ийн 5 баганыг дарааллаар нь
export const flowStages: FlowStage[] = [
  {
    id: "intro",
    lane: "Танилцуулга",
    action: "Байгууллагаа танилцуулах",
    document: "Байгууллагын танилцуулга",
    href: "/about",
    icon: Building2,
  },
  {
    id: "training",
    lane: "Business Training Service",
    action: "Сургалтын үйлчилгээ үзүүлэх",
    document: "Сургалтын үйлчилгээ, үнийн санал",
    href: "/services/training",
    icon: BookOpen,
  },
  {
    id: "laboratory",
    lane: "Business Laboratory Service",
    action: "Business Laboratory үйлчилгээ үзүүлэх",
    document: "Үйлчилгээний танилцуулга, үнийн санал",
    href: "/services/laboratory",
    icon: FlaskConical,
  },
  {
    id: "update",
    lane: "Business Update Service",
    action: "Business Update үйлчилгээ үзүүлэх",
    document: "Үйлчилгээний танилцуулга",
    href: "/services/update",
    icon: RefreshCw,
  },
  {
    id: "report",
    lane: "Тайлан",
    action: "Тайлан хүлээлгэж өгөх",
    document: "Тайлангийн загвартай танилцах",
    href: "/report",
    icon: FileBarChart,
  },
]
