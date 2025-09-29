// import { useState, useEffect } from 'react';
// import { useToast } from '@/hooks/use-toast';

// export interface KeyIssue {
//   id: string;
//   bookingId: string;
//   vehicleId: string;
//   issuedBy: string;
//   issuedAt: string;
//   expectedReturn: string;
//   actualReturn: string | null;
//   returnCondition: string | null;
//   damageNotes: string | null;
//   status: 'issued' | 'returned' | 'overdue';
//   createdAt: string;
//   updatedAt: string;
// }

// export function useKeyManagement() {
//   const [keyIssues, setKeyIssues] = useState<KeyIssue[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { toast } = useToast();

//   const fetchKeyIssues = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('key_issues')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       const transformedKeyIssues: KeyIssue[] = data.map(k => ({
//         id: k.id,
//         bookingId: k.booking_id,
//         vehicleId: k.vehicle_id,
//         issuedBy: k.issued_by,
//         issuedAt: k.issued_at,
//         expectedReturn: k.expected_return,
//         actualReturn: k.actual_return,
//         returnCondition: k.return_condition,
//         damageNotes: k.damage_notes,
//         status: k.status,
//         createdAt: k.created_at,
//         updatedAt: k.updated_at,
//       }));

//       setKeyIssues(transformedKeyIssues);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching key issues:', err);
//       setError(err instanceof Error ? err.message : 'Failed to fetch key issues');
//       toast({
//         title: "Error",
//         description: "Failed to load key issues",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const issueKey = async (keyData: Omit<KeyIssue, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'actualReturn' | 'returnCondition' | 'damageNotes'>) => {
//     try {
//       const { data, error } = await supabase
//         .from('key_issues')
//         .insert({
//           booking_id: keyData.bookingId,
//           vehicle_id: keyData.vehicleId,
//           issued_by: keyData.issuedBy,
//           issued_at: keyData.issuedAt,
//           expected_return: keyData.expectedReturn,
//           status: 'issued',
//         })
//         .select()
//         .single();

//       if (error) throw error;

//       await fetchKeyIssues();
//       toast({
//         title: "Success",
//         description: "Key issued successfully",
//       });

//       return data;
//     } catch (err) {
//       console.error('Error issuing key:', err);
//       toast({
//         title: "Error",
//         description: "Failed to issue key",
//         variant: "destructive"
//       });
//       throw err;
//     }
//   };

//   const returnKey = async (id: string, returnData: {
//     actualReturn: string;
//     returnCondition: string;
//     damageNotes?: string;
//   }) => {
//     try {
//       const { error } = await supabase
//         .from('key_issues')
//         .update({
//           actual_return: returnData.actualReturn,
//           return_condition: returnData.returnCondition,
//           damage_notes: returnData.damageNotes || null,
//           status: 'returned',
//           updated_at: new Date().toISOString(),
//         })
//         .eq('id', id);

//       if (error) throw error;

//       await fetchKeyIssues();
//       toast({
//         title: "Success",
//         description: "Key returned successfully",
//       });
//     } catch (err) {
//       console.error('Error returning key:', err);
//       toast({
//         title: "Error",
//         description: "Failed to process key return",
//         variant: "destructive"
//       });
//       throw err;
//     }
//   };

//   const markOverdue = async (id: string) => {
//     try {
//       const { error } = await supabase
//         .from('key_issues')
//         .update({
//           status: 'overdue',
//           updated_at: new Date().toISOString(),
//         })
//         .eq('id', id);

//       if (error) throw error;

//       await fetchKeyIssues();
//     } catch (err) {
//       console.error('Error marking key overdue:', err);
//     }
//   };

//   useEffect(() => {
//     fetchKeyIssues();
//   }, []);

//   return {
//     keyIssues,
//     loading,
//     error,
//     fetchKeyIssues,
//     issueKey,
//     returnKey,
//     markOverdue,
//   };
// }