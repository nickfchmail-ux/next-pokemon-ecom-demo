import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { getInvoices } from '../../_lib/data-service';

export default async function Page() {
  const invoices = await getInvoices();
  console.log(JSON.stringify(invoices));

  return invoices?.length > 0 ? (
    <Box
      className="flex min-h-fit m-5 max-w-[80%] mx-auto"
      sx={{ flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Your Orders
      </Typography>
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }} aria-label="orders table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Billing Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Shipping Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice, index) => (
              <TableRow
                key={invoice.id}
                sx={{
                  '&:hover': { backgroundColor: 'action.selected' },
                  backgroundColor: index % 2 === 0 ? 'background.default' : 'action.hover',
                }}
              >
                <TableCell>{invoice.order_id}</TableCell>
                <TableCell>
                  {new Date(invoice.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  {invoice.shipping_address.street
                    ? `${invoice.shipping_address.street}, ${invoice.shipping_address.city}, ${invoice.shipping_address.state} ${invoice.shipping_address.zip_code}, ${invoice.shipping_address.country}`
                    : invoice.shipping_address.address || 'N/A'}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        invoice.payment_status === 'pending'
                          ? '#FFD700'
                          : invoice.payment_status === 'paid'
                            ? '#228B22'
                            : '#FF0000',
                      fontWeight: 'medium',
                    }}
                  >
                    <span
                      className={`py-2 px-4 ${invoice.payment_status === 'pending' ? 'bg-amber-100' : invoice.payment_status === 'paid' ? 'bg-green-100' : 'bg-red-100'}  rounded-2xl `}
                    >
                      {invoice.payment_status.charAt(0).toUpperCase() +
                        invoice.payment_status.slice(1)}
                    </span>
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  ) : (
    <div className={`flex justify-center items-center`}>
      <h1>You have no orders yet</h1>
    </div>
  );
}
