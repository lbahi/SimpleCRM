// SimpleCRM — use-workspace-dnd.ts
import { 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PipelineLead, ColumnId } from "../model";

export function useWorkspaceDnd(
  leads: PipelineLead[],
  reorderLeads: (newOrder: string[]) => void,
  columnOrder: ColumnId[],
  reorderColumns: (newOrder: ColumnId[]) => void
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Check if dragging a row (lead) or column
    const activeId = String(active.id);
    const overId = String(over.id);
    
    // Check if it's a column drag (column IDs are in columnOrder)
    if (columnOrder.includes(activeId as ColumnId) && columnOrder.includes(overId as ColumnId)) {
      // Handle column reordering
      const oldIndex = columnOrder.findIndex((col) => col === activeId);
      const newIndex = columnOrder.findIndex((col) => col === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex);
        reorderColumns(newColumnOrder);
      }
    } else {
      // Handle row reordering
      const oldIndex = leads.findIndex((l) => l.id === activeId);
      const newIndex = leads.findIndex((l) => l.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(leads, oldIndex, newIndex).map(l => l.id);
        reorderLeads(newOrder);
      }
    }
  };

  return { sensors, handleDragEnd };
}
