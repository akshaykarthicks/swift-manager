
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TasksByStatusChartProps {
  tasks: Task[];
}

export const TasksByStatusChart = ({ tasks }: TasksByStatusChartProps) => {
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  
  useEffect(() => {
    // Group tasks by status and count them
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Format data for the chart
    const formattedData = Object.entries(statusCounts).map(([status, count]) => {
      let name = status;
      // Format the status labels
      switch (status) {
        case "todo":
          name = "To Do";
          break;
        case "in-progress":
          name = "In Progress";
          break;
        case "review":
          name = "In Review";
          break;
        case "completed":
          name = "Completed";
          break;
      }
      
      return { name, value: count };
    });
    
    setChartData(formattedData);
  }, [tasks]);
  
  // Colors for the different statuses
  const COLORS = {
    "To Do": "#94a3b8",
    "In Progress": "#3b82f6",
    "In Review": "#a855f7",
    "Completed": "#22c55e",
  };
  
  const DEFAULT_COLOR = "#cbd5e1";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks by Status</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] pt-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={COLORS[entry.name as keyof typeof COLORS] || DEFAULT_COLOR} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value, "Tasks"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No task data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
