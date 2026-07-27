import {
  BookOpen,
  BriefcaseBusiness,
  BusFront,
  CircleDollarSign,
  HeartPulse,
  LibraryBig,
  PanelsTopLeft,
  Signpost,
  type LucideIcon,
} from "lucide-react";
import type { ResourceCategory } from "@/data/resources";

export const categoryIcons = {
  "Core portals": PanelsTopLeft,
  "Classes & academics": BookOpen,
  "Advising & degree planning": Signpost,
  "Study & course tools": LibraryBig,
  "Careers & involvement": BriefcaseBusiness,
  "Health, support & safety": HeartPulse,
  "Money & administration": CircleDollarSign,
  "Campus life & logistics": BusFront,
} satisfies Record<ResourceCategory, LucideIcon>;
