import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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

  return invoices?.length > 0 ? (
    <Box
      className="flex min-h-screen m-5 md:max-w-[80%] mx-auto overflow-x-auto"
      sx={{ flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Your Orders
      </Typography>
      <TableContainer
        component={Paper}
        elevation={3}
        sx={{ borderRadius: 2, overflow: 'auto', maxHeight: 440 }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="orders table" stickyHeader>
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
                  {invoice.shipping_address !== 'pending for submission' ? (
                    <div className={`space-y-2`}>
                      {invoice.shipping_address.line1 ? (
                        <p>{invoice.shipping_address.line1}</p>
                      ) : null}
                      {invoice.shipping_address.line2 ? (
                        <p>{invoice.shipping_address.line2}</p>
                      ) : null}
                      {invoice.shipping_address.state ? (
                        <p>{invoice.shipping_address.state}</p>
                      ) : null}
                      {invoice.shipping_address.country ? (
                        <p>{invoice.shipping_address.country}</p>
                      ) : null}
                      {invoice.shipping_address.postal_code ? (
                        <p>{invoice.shipping_address.postal_code}</p>
                      ) : null}
                    </div>
                  ) : (
                    'Not Provided'
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      invoice.payment_status.charAt(0).toUpperCase() +
                      invoice.payment_status.slice(1)
                    }
                    color={
                      invoice.payment_status === 'pending'
                        ? 'warning'
                        : invoice.payment_status === 'paid'
                          ? 'success'
                          : 'error'
                    }
                    variant="outlined"
                    sx={{ fontWeight: 'medium' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  ) : (
    <Box className="flex justify-center items-center min-h-screen">
      <Typography variant="h6" component="h1">
        You have no orders yet
      </Typography>
    </Box>
  );
}
