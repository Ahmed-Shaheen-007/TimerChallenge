import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function calculateProgressPercentage(current: number, target: number): number {
  if (target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(100, Math.max(0, percentage));
}

export function getInitials(name: string): string {
  if (!name) return "";
  return name.split(" ")[0].charAt(0).toUpperCase();
}

export function generateRandomColor(): string {
  const colors = [
    "#3b82f6", // blue
    "#22c55e", // green
    "#ec4899", // pink
    "#8b5cf6", // purple
    "#f97316", // orange
    "#06b6d4", // cyan
    "#eab308", // yellow
    "#ef4444", // red
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getTimeRemaining(endDate: Date): string {
  return formatDistance(endDate, new Date(), { addSuffix: true });
}
