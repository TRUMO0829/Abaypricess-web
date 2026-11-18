import { BookOpen, FlaskConical, RefreshCw } from "lucide-react"

import type { FlowStage } from "@/types/content"

// Үндсэн 3 үйлчилгээ (docs/brief/process-diagram.png-ийн дунд 3 багана)
export const flowStages: FlowStage[] = [
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
]

/** Диаграммын шошго */
export const flowLabels = {
  action: "Үйлдэл",
  document: "Баримт",
}
