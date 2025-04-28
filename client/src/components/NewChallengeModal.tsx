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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface NewChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  targetValue: z.number().positive("Target value must be positive"),
  unit: z.string().min(1, "Unit is required"),
  customUnit: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  participants: z.array(z.number()).min(1, "At least one participant is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewChallengeModal({
  open,
  onOpenChange,
}: NewChallengeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      targetValue: undefined,
      unit: 'hours',
      customUnit: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      participants: [],
    },
  });
  
  const selectedUnit = watch('unit');
  
  useEffect(() => {
    setShowCustomUnit(selectedUnit === 'custom');
  }, [selectedUnit]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
        
        // Add the current user as a default participant
        if (data.length > 0) {
          setSelectedUsers([data[0]]);
          setValue('participants', [data[0].id]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    fetchUsers();
  }, [setValue]);
  
  const addParticipant = (user: User) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);
      setValue('participants', newSelectedUsers.map(u => u.id));
    }
  };
  
  const removeParticipant = (userId: number) => {
    const newSelectedUsers = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(newSelectedUsers);
    setValue('participants', newSelectedUsers.map(u => u.id));
  };
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Use custom unit if selected
      const finalUnit = data.unit === 'custom' ? data.customUnit : data.unit;
      
      await apiRequest('POST', '/api/challenges', {
        title: data.title,
        targetValue: data.targetValue,
        unit: finalUnit,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        participants: data.participants,
      });
      
      // Invalidate challenges query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      
      toast({
        title: "Challenge created",
        description: "Your new challenge has been created successfully!",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Challenge Title</Label>
              <Input
                id="title"
                placeholder="e.g. Study for 712 hours"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  min={1}
                  placeholder="e.g. 712"
                  {...register('targetValue', { valueAsNumber: true })}
                />
                {errors.targetValue && (
                  <p className="text-sm text-destructive">{errors.targetValue.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Controller
                  control={control}
                  name="unit"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="tasks">Tasks</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && (
                  <p className="text-sm text-destructive">{errors.unit.message}</p>
                )}
              </div>
            </div>
            
            {showCustomUnit && (
              <div className="grid gap-2">
                <Label htmlFor="customUnit">Custom Unit</Label>
                <Input
                  id="customUnit"
                  placeholder="e.g. pages, kilometers, etc."
                  {...register('customUnit')}
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Invite Friends</Label>
              <div className="bg-background border rounded-md p-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedUsers.map(user => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                      {user.username}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeParticipant(user.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <select 
                  className="bg-transparent w-full focus:outline-none"
                  onChange={(e) => {
                    const userId = parseInt(e.target.value);
                    if (!isNaN(userId)) {
                      const user = users.find(u => u.id === userId);
                      if (user) {
                        addParticipant(user);
                        e.target.value = ""; // Reset select
                      }
                    }
                  }}
                >
                  <option value="">Add more participants...</option>
                  {users.filter(user => !selectedUsers.some(u => u.id === user.id))
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                  ))}
                </select>
              </div>
              {errors.participants && (
                <p className="text-sm text-destructive">{errors.participants.message}</p>
              )}
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
              {isSubmitting ? "Creating..." : "Create Challenge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
