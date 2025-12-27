import Button from '@mui/material/Button';
import { handleSignIn } from '../_lib/actions';
export default function LoginNavigation() {
  return (
    <div>
      <h1>Please sign in to continue</h1>
      <Button onClick={handleSignIn}>Sign in</Button>
    </div>
  );
}
