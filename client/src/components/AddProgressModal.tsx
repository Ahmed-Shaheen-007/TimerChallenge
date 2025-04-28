import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AddProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: number;
  unit: string;
  onAddProgress?: (participantId: number, value: number, date: string, notes?: string) => void;
}

const formSchema = z.object({
  value: z.number().positive("Value must be positive"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddProgressModal({
  open,
  onOpenChange,
  participantId,
  unit,
  onAddProgress,
}: AddProgressModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const unitLabel = unit.charAt(0).toUpperCase() + unit.slice(1);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      await apiRequest('POST', '/api/progress', {
        participantId,
        value: data.value,
        date: new Date(data.date),
        notes: data.notes,
      });
      
      // Invalidate challenges query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      
      toast({
        title: "Progress added",
        description: `Added ${data.value} ${unit} to your progress.`,
      });
      
      // Also call the callback if provided
      if (onAddProgress) {
        onAddProgress(participantId, data.value, data.date, data.notes);
      }
      
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding progress:", error);
      toast({
        title: "Error",
        description: "Failed to add progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add {unitLabel}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="value" className="mb-1">
                {unitLabel} to add
              </Label>
              <Input
                id="value"
                type="number"
                step={unit === 'hours' ? 0.5 : 1}
                min={0}
                placeholder={`Enter ${unit}`}
                {...register('value', { valueAsNumber: true })}
              />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date" className="mb-1">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes" className="mb-1">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="What did you work on?"
                className="h-24"
                {...register('notes')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : `Add ${unitLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
