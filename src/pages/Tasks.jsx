import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Menu, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import KanbanBoard from "@/components/tasks/KanbanBoard";

export default function TasksPage() {
  return <KanbanBoard />;
}