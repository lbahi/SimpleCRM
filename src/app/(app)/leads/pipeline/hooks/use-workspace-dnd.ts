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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    
    // Check if dragging a column
    const isColumnDrag = columnOrder.includes(activeId as ColumnId);
    
    if (isColumnDrag) {
      const oldIndex = columnOrder.indexOf(activeId as ColumnId);
      const newIndex = columnOrder.indexOf(overId as ColumnId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderColumns(arrayMove(columnOrder, oldIndex, newIndex));
      }
    } else {
      // Row reorder
      const oldIndex = leads.findIndex((l) => l.id === activeId);
      const newIndex = leads.findIndex((l) => l.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderLeads(arrayMove(leads, oldIndex, newIndex).map(l => l.id));
      }
    }
  };

  return { sensors, handleDragEnd };
}
