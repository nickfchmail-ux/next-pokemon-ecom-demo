import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { auth } from '../_lib/auth';
import { getInvoices, getUser } from '../_lib/data-service';
export default async function Page() {
  const session = await auth();
  const { id, created_at, ...userProfile } = await getUser(session?.user?.email);

  const invoices = await getInvoices();

  return (
    <Box
      className="flex min-h-screen flex-col p-5"
      sx={{
        margin: 'auto',
        background: 'linear-gradient(to bottom, #292C4A 0%, #ffffff 100%)', // Pokémon red-to-white gradient
        color: '#333',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          src={session?.user?.image} // Fun Pokémon profile icon
          alt="User Avatar"
          sx={{ width: 100, height: 100, margin: 'auto', border: '2px solid #fff' }}
        />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mt: 2, color: '#fff' }}>
          Welcome, {session?.user?.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#fff' }}>
          Your Pokémon Store Account
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={5} sx={{ borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Account Details
              </Typography>
              <Typography variant="body1">Email: {session?.user?.email}</Typography>
              <Typography variant="body1">
                Member Since: {new Date(created_at).toLocaleString('default', { month: 'short' })}
                {new Date(created_at).toLocaleString('default', { year: '2-digit' })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={5} sx={{ borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Quick Stats
              </Typography>
              <Typography variant="body1">Total Orders: {invoices.length}</Typography>
              <Typography variant="body1">Loyalty Points: {invoices.length * 15}</Typography>
              <Typography variant="body1">Favorite Pokémon: Pikachu</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
