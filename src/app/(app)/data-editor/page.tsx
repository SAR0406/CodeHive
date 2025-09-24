
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Database, Loader2, Plus, Save, Trash2, X, RefreshCw } from 'lucide-react';
import { getRows, updateRows, type Action } from './actions';
import { useToast } from '@/hooks/use-toast';

const ALLOWED_TABLES = ['tasks', 'profiles'];

type Row = Record<string, any>;

export default function DataEditorPage() {
  const [selectedTable, setSelectedTable] = useState<string>(ALLOWED_TABLES[0]);
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Action[]>([]);
  const { toast } = useToast();

  const fetchTableData = useCallback(async (table: string) => {
    setIsLoading(true);
    setRows([]);
    setColumns([]);
    setPendingChanges([]);

    const result = await getRows(table);
    if (result.error) {
      toast({ title: 'Error fetching data', description: result.error, variant: 'destructive' });
    } else if (result.data) {
      setRows(result.data);
      if (result.data.length > 0) {
        setColumns(Object.keys(result.data[0]));
      }
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTableData(selectedTable);
  }, [selectedTable, fetchTableData]);

  const handleInputChange = (id: string | number, column: string, value: any) => {
    const isNewRow = id.toString().startsWith('new-');
    if (isNewRow) {
      const changeIndex = pendingChanges.findIndex(c => c.type === 'insert' && c.row.id === id);
      if (changeIndex > -1) {
        const updatedChanges = [...pendingChanges];
        updatedChanges[changeIndex].row[column] = value;
        setPendingChanges(updatedChanges);
      }
    } else {
      const changeIndex = pendingChanges.findIndex(c => c.type === 'update' && c.id === id);
      if (changeIndex > -1) {
        const updatedChanges = [...pendingChanges];
        updatedChanges[changeIndex].row[column] = value;
        setPendingChanges(updatedChanges);
      } else {
        setPendingChanges([...pendingChanges, { type: 'update', id, row: { [column]: value } }]);
      }
    }

    setRows(rows.map(r => (r.id === id ? { ...r, [column]: value } : r)));
  };

  const handleAddNewRow = () => {
    const newId = `new-${Date.now()}`;
    const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: col === 'id' ? newId : '' }), {});
    setRows([newRow as Row, ...rows]);
    setPendingChanges([...pendingChanges, { type: 'insert', row: { ...newRow, id: newId } }]);
  };
  
  const handleDeleteRow = (id: string | number) => {
    const isNewRow = id.toString().startsWith('new-');
    if (isNewRow) {
        // Just remove from UI and pending changes
        setRows(rows.filter(r => r.id !== id));
        setPendingChanges(pendingChanges.filter(c => !(c.type === 'insert' && c.row.id === id)));
    } else {
        // Mark for deletion
        setPendingChanges(pendingChanges.filter(c => c.type === 'update' && c.id !== id)); // Remove any pending updates for this row
        setPendingChanges(prev => [...prev, { type: 'delete', id }]);
        // Visually disable or style the row
        setRows(rows.map(r => r.id === id ? {...r, _deleted: true} : r));
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const result = await updateRows(selectedTable, pendingChanges);

    if (result.error) {
        toast({ title: 'Error saving changes', description: result.error, variant: 'destructive' });
    } else {
        const errorResults = result.results.filter(r => !r.success);
        if (errorResults.length > 0) {
            toast({
                title: `${errorResults.length} of ${result.results.length} changes failed`,
                description: `Errors on rows: ${errorResults.map(r => r.id).join(', ')}. Check console for details.`,
                variant: 'destructive',
            });
            console.error('Failed changes:', errorResults);
        } else {
            toast({ title: 'Success!', description: 'All changes have been saved.' });
        }
    }
    
    // Refetch data to get a clean state from the server
    await fetchTableData(selectedTable); 
    setIsLoading(false);
  };
  
  const renderCell = (row: Row, column: string) => {
    const value = row[column];
    const isEditable = !(column === 'id' || column.endsWith('_at'));
    const isDeleted = row._deleted;

    if (!isEditable) {
        return <span className="text-muted-foreground text-xs opacity-75">{value}</span>;
    }

    // Handle JSON arrays like 'tags'
    if (Array.isArray(value)) {
        return (
            <Input
              value={value.join(', ')}
              onChange={(e) => handleInputChange(row.id, column, e.target.value.split(',').map(s => s.trim()))}
              className={`h-8 bg-muted/30 ${isDeleted ? 'bg-red-900/50' : ''}`}
              disabled={isDeleted}
            />
        );
    }
    
    return (
        <Input
          value={value ?? ''}
          onChange={(e) => handleInputChange(row.id, column, e.target.value)}
          className={`h-8 bg-muted/30 ${isDeleted ? 'bg-red-900/50' : ''}`}
          disabled={isDeleted}
        />
    );
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
          <Database className="size-8 text-accent" />
          <span>Data Editor</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          A secure interface to directly view and edit your Supabase data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_TABLES.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <Button variant="outline" size="icon" onClick={() => fetchTableData(selectedTable)} disabled={isLoading}>
                    <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddNewRow}><Plus className="mr-2" /> Add Row</Button>
              <Button onClick={handleSaveChanges} disabled={pendingChanges.length === 0 || isLoading}>
                {isLoading && pendingChanges.length > 0 ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                Save ({pendingChanges.length}) Changes
              </Button>
            </div>
          </div>
          <CardDescription className="mt-2">
            Displaying the first 100 rows from the '{selectedTable}' table.
            Changes are saved in a batch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead className="w-12"></TableHead>
                  {columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="text-center h-48">
                      <Loader2 className="mx-auto animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} data-state={row._deleted ? 'deleted' : ''} className={row._deleted ? 'opacity-50' : ''}>
                      <TableCell>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteRow(row.id)} disabled={row._deleted}>
                              {row._deleted ? <X /> : <Trash2 size={16} />}
                          </Button>
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col} className="min-w-[150px]">
                           {renderCell(row, col)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
